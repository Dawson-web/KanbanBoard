import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Layout, theme } from "antd";
import EventType from "@/types/event";
import EventBar from "@/components/EventBar";
import TaskBox from "@/components/TaskBox";

function App() {
  const { token } = theme.useToken();

  const initEvent = useMemo(
    () => [
      {
        title: "新建事件",
        columnColors: {
          "To do": "#faad14",
          "In progress": "#1677ff",
          Completed: "#52c41a",
        },
        history: [
          {
            type: EventType.CREATEEVENT,
            date: new Date().getTime(),
            desc: "创建事件-新建事件",
            details: "创建事件-新建事件",
            user: null,
          },
        ],
        ["To do"]: [],
        ["In progress"]: [],
        ["Completed"]: [],
      },
    ],
    []
  );

  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      // 确保所有事件都有列颜色属性和历史记录
      return parsedEvents.map((event) => ({
        ...event,
        columnColors: event.columnColors || {
          "To do": "#faad14",
          "In progress": "#1677ff",
          Completed: "#52c41a",
        },
        history: event.history || [
          {
            type: EventType.CREATEEVENT,
            date: new Date().getTime(),
            desc: `创建事件-${event.title}`,
            details: `创建事件-${event.title}`,
            user: null,
          },
        ],
      }));
    }
    return initEvent;
  });

  const [currentEvent, setCurrentEvent] = useState(events[0]);

  const updateEvents = useCallback(async () => {
    try {
      if (!events.length) {
        await localStorage.setItem("events", JSON.stringify(initEvent));
        setEvents(JSON.parse(localStorage.getItem("events")));
      } else {
        await localStorage.setItem("events", JSON.stringify(events));
      }
    } catch (e) {
      console.error("Failed to modify events!");
    }
  }, [events, initEvent]);

  // Set localStorage
  useEffect(() => {
    updateEvents();
  }, [events]);

  return (
    <Layout className="h-screen overflow-y-hidden">
      <EventBar
        events={events}
        setEvents={setEvents}
        currentEvent={currentEvent}
        setCurrentEvent={setCurrentEvent}
      />
      <TaskBox
        events={events}
        setEvents={setEvents}
        currentEvent={currentEvent}
        setCurrentEvent={setCurrentEvent}
      />
    </Layout>
  );
}

export default App;
