import React, { useState } from "react";
import { Modal } from "antd";
import {
  Timeline,
  Typography,
  Grid,
  Radio,
  Tooltip,
} from "@arco-design/web-react";
import {
  IconPlus,
  IconDelete,
  IconEdit,
  IconRight,
  IconList,
} from "@arco-design/web-react/icon";
import EventType from "@/types/event";
import "@arco-design/web-react/dist/css/arco.css";

const TimelineItem = Timeline.Item;
const { Row } = Grid;
const { Text } = Typography;

const EventTimeline = ({ currentEvent, isTimelineOpen, setIsTimelineOpen }) => {
  // 获取事件类型对应的图标和颜色
  const getEventIcon = (type) => {
    switch (type) {
      case EventType.CREATEEVENT:
      case EventType.CREATECLOUMN:
      case EventType.CREATETASK:
        return <IconPlus style={{ color: "#10b981" }} />;
      case EventType.DELETEEVENT:
      case EventType.DELETECLOUMN:
      case EventType.DELETETASK:
        return <IconDelete style={{ color: "#f43f5e" }} />;
      case EventType.EDITEVENT:
      case EventType.EDITECLOUMN:
      case EventType.EDITTASK:
        return <IconEdit style={{ color: "#8b5cf6" }} />;
      case EventType.MOVETASK:
        return <IconRight style={{ color: "#3b82f6" }} />;
      default:
        return <IconList style={{ color: "#6b7280" }} />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case EventType.CREATEEVENT:
      case EventType.CREATECLOUMN:
      case EventType.CREATETASK:
        return "#059669";
      case EventType.DELETEEVENT:
      case EventType.DELETECLOUMN:
      case EventType.DELETETASK:
        return "#e11d48";
      case EventType.EDITEVENT:
      case EventType.EDITECLOUMN:
      case EventType.EDITTASK:
        return "#7c3aed";
      case EventType.MOVETASK:
        return "#2563eb";
      default:
        return "#4b5563";
    }
  };

  // 格式化时间戳
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      title="事件时间线"
      open={isTimelineOpen}
      onCancel={() => setIsTimelineOpen(false)}
      footer={null}
      width={800}
      centered
      bodyStyle={{ overflowX: "auto", padding: "24px 0" }}
    >
      <Timeline
        direction="horizontal"
        mode="alternate"
        className="min-w-max px-6 h-[300px] overflow-y-hidden"
      >
        {currentEvent.history
          .slice()
          .reverse()
          .map((item, index) => (
            <TimelineItem
              key={index}
              lineType="solid"
              style={{ width: "180px", padding: "0 12px" }}
            >
              <Row align="start">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${getEventColor(item.type)}15`,
                  }}
                >
                  {getEventIcon(item.type)}
                </div>
                <Tooltip content={item.details}>
                  <div style={{ marginBottom: 12, marginLeft: 8 }}>
                    <div>
                      {item.desc.split("-")[0]}
                      <div style={{ fontSize: 12, color: "#4E5969" }}>
                        {formatDate(item.date)}
                      </div>
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#4E5969" }}
                      className="line-clamp-2"
                    >
                      {item.desc.split("-").slice(1).join("-")}
                    </div>
                  </div>
                </Tooltip>
              </Row>
            </TimelineItem>
          ))}
      </Timeline>
    </Modal>
  );
};

export default EventTimeline;
