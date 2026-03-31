import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Board from "./components/Board";
import TaskModal from "./components/TaskModal";
import TaskDetailsDrawer from "./components/TaskDetailsDrawer";
import TeamPanel from "./components/TeamPanel";
import {
  ensureGuestSession,
  hasSupabaseEnv,
  supabase,
  getSupabaseConfigError,
} from "./lib/supabase";
import { groupTasks } from "./utils/helpers";

export default function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [taskLabels, setTaskLabels] = useState([]);
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");

  const userId = session?.user?.id;

  useEffect(() => {
    let active = true;
    let channel = null;

    async function boot() {
      try {
        setLoading(true);
        setError("");

        if (!hasSupabaseEnv) {
          throw new Error(getSupabaseConfigError());
        }

        const activeSession = await ensureGuestSession();
        if (!active) return;

        setSession(activeSession);
        await loadAll(activeSession.user.id);

        channel = supabase
          .channel("tasks-realtime")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "tasks",
              filter: `user_id=eq.${activeSession.user.id}`,
            },
            async () => {
              if (!active) return;
              await loadAll(activeSession.user.id);
            }
          )
          .subscribe();
      } catch (e) {
        if (active) {
          setError(e?.message || "Failed to load the app.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    boot();

    return () => {
      active = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function loadAll(uid) {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const [
      tasksRes,
      teamRes,
      labelsRes,
      taskLabelsRes,
      taskAssigneesRes,
      commentsRes,
      activityRes,
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),

      supabase
        .from("team_members")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true }),

      supabase
        .from("labels")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true }),

      supabase.from("task_labels").select("*").eq("user_id", uid),

      supabase.from("task_assignees").select("*").eq("user_id", uid),

      supabase
        .from("comments")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true }),

      supabase
        .from("task_activity")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
    ]);

    const firstError = [
      tasksRes.error,
      teamRes.error,
      labelsRes.error,
      taskLabelsRes.error,
      taskAssigneesRes.error,
      commentsRes.error,
      activityRes.error,
    ].find(Boolean);

    if (firstError) throw firstError;

    setTasks(tasksRes.data || []);
    setTeamMembers(teamRes.data || []);
    setLabels(labelsRes.data || []);
    setTaskLabels(taskLabelsRes.data || []);
    setTaskAssignees(taskAssigneesRes.data || []);
    setComments(commentsRes.data || []);
    setActivity(activityRes.data || []);
  }

  async function createTask(form) {
    try {
      if (!supabase || !userId) throw new Error("User session not ready.");

      setError("");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: form.title,
          description: form.description || null,
          status: "todo",
          priority: form.priority,
          due_date: form.due_date || null,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      const activityInsert = await supabase.from("task_activity").insert({
        task_id: data.id,
        action: "Task created",
        meta: { title: data.title },
        user_id: userId,
      });

      if (activityInsert.error) throw activityInsert.error;

      if (form.assigneeIds?.length) {
        const assigneeRows = form.assigneeIds.map((memberId) => ({
          task_id: data.id,
          member_id: memberId,
          user_id: userId,
        }));

        const { error: assigneeError } = await supabase
          .from("task_assignees")
          .insert(assigneeRows);

        if (assigneeError) throw assigneeError;
      }

      if (form.labelIds?.length) {
        const labelRows = form.labelIds.map((labelId) => ({
          task_id: data.id,
          label_id: labelId,
          user_id: userId,
        }));

        const { error: labelError } = await supabase
          .from("task_labels")
          .insert(labelRows);

        if (labelError) throw labelError;
      }

      await loadAll(userId);
      setOpenCreate(false);
    } catch (e) {
      setError(e?.message || "Failed to create task");
    }
  }

  async function moveTask(taskId, newStatus) {
    try {
      if (!supabase || !userId) throw new Error("User session not ready.");

      setError("");

      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      const oldStatus = task.status;

      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) throw error;

      const activityInsert = await supabase.from("task_activity").insert({
        task_id: taskId,
        action: `Moved from ${oldStatus} to ${newStatus}`,
        meta: { from: oldStatus, to: newStatus },
        user_id: userId,
      });

      if (activityInsert.error) throw activityInsert.error;

      await loadAll(userId);
    } catch (e) {
      setError(e?.message || "Failed to update task");
    }
  }

  async function addComment(taskId, body) {
    try {
      if (!supabase || !userId) throw new Error("User session not ready.");

      const { error } = await supabase.from("comments").insert({
        task_id: taskId,
        body,
        user_id: userId,
      });

      if (error) throw error;

      const activityInsert = await supabase.from("task_activity").insert({
        task_id: taskId,
        action: "Comment added",
        meta: { body },
        user_id: userId,
      });

      if (activityInsert.error) throw activityInsert.error;

      await loadAll(userId);
    } catch (e) {
      setError(e?.message || "Failed to add comment");
    }
  }

  async function createTeamMember(member) {
    try {
      if (!supabase || !userId) throw new Error("User session not ready.");

      const { error } = await supabase.from("team_members").insert({
        name: member.name,
        color: member.color,
        avatar_text: member.avatar_text,
        user_id: userId,
      });

      if (error) throw error;

      await loadAll(userId);
    } catch (e) {
      setError(e?.message || "Failed to add team member");
    }
  }

  async function createLabel(label) {
    try {
      if (!supabase || !userId) throw new Error("User session not ready.");

      const { error } = await supabase.from("labels").insert({
        name: label.name,
        color: label.color,
        user_id: userId,
      });

      if (error) throw error;

      await loadAll(userId);
    } catch (e) {
      setError(e?.message || "Failed to add label");
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const currentLabelIds = taskLabels
        .filter((row) => row.task_id === task.id)
        .map((row) => row.label_id);

      const matchesLabel =
        labelFilter === "all" || currentLabelIds.includes(labelFilter);

      return matchesSearch && matchesPriority && matchesLabel;
    });
  }, [tasks, search, priorityFilter, labelFilter, taskLabels]);

  const grouped = useMemo(() => groupTasks(filteredTasks), [filteredTasks]);

  const summary = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        t.status !== "done" &&
        new Date(t.due_date) < new Date(new Date().toDateString())
    ).length;

    return {
      total: tasks.length,
      completed,
      overdue,
    };
  }, [tasks]);

  return (
    <div className="app-shell">
      <div className="bg-layer bg-layer-one" />
      <div className="bg-layer bg-layer-two" />

      <main className="app-main">
        <div className="container">
          <Header
            summary={summary}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            labelFilter={labelFilter}
            setLabelFilter={setLabelFilter}
            labels={labels}
            openCreate={() => setOpenCreate(true)}
          />

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="loading-panel">Loading your board...</div>
          ) : (
            <div className="content-layout">
              <div className="board-wrap">
                <Board
                  grouped={grouped}
                  moveTask={moveTask}
                  onOpenTask={setSelectedTask}
                  taskLabels={taskLabels}
                  labels={labels}
                  taskAssignees={taskAssignees}
                  teamMembers={teamMembers}
                />
              </div>

              <div className="side-panel">
                <TeamPanel
                  teamMembers={teamMembers}
                  createTeamMember={createTeamMember}
                  labels={labels}
                  createLabel={createLabel}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {openCreate && (
        <TaskModal
          teamMembers={teamMembers}
          labels={labels}
          onClose={() => setOpenCreate(false)}
          onSubmit={createTask}
        />
      )}

      {selectedTask && (
        <TaskDetailsDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          comments={comments.filter((c) => c.task_id === selectedTask.id)}
          activity={activity.filter((a) => a.task_id === selectedTask.id)}
          labels={labels.filter((label) =>
            taskLabels.some(
              (tl) =>
                tl.task_id === selectedTask.id && tl.label_id === label.id
            )
          )}
          assignees={teamMembers.filter((member) =>
            taskAssignees.some(
              (ta) =>
                ta.task_id === selectedTask.id && ta.member_id === member.id
            )
          )}
          addComment={addComment}
        />
      )}
    </div>
  );
}