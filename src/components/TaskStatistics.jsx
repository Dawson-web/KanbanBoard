import {
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Tabs,
  Space,
  Badge,
  Button,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  InboxOutlined,
  FileTextOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef, useMemo } from "react";

const TaskStatistics = ({
  currentEvent,
  isTaskStatisticsOpen,
  setIsTaskStatisticsOpen,
}) => {
  const [position, setPosition] = useState({
    x: window.screen.width - 600,
    y: window.screen.height - 600,
  });
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 计算各类任务数量 - 使用useMemo减少重复计算
  const taskStats = useMemo(() => {
    // 基础数据计算
    const todoCount =
      currentEvent["To do"]?.filter((task) => task && task.id)?.length || 0;
    const inProgressCount =
      currentEvent["In progress"]?.filter((task) => task && task.id)?.length ||
      0;
    const completedCount =
      currentEvent["Completed"]?.filter((task) => task && task.id)?.length || 0;

    // 自定义列计算
    const customColumns = Object.keys(currentEvent).filter(
      (key) =>
        ![
          "title",
          "columnColors",
          "To do",
          "In progress",
          "Completed",
          "history",
        ].includes(key)
    );

    const customColumnsCount = customColumns.reduce((total, column) => {
      return (
        total +
        (currentEvent[column]?.filter((task) => task && task.id)?.length || 0)
      );
    }, 0);

    // 总任务数
    const totalTasks =
      todoCount + inProgressCount + completedCount + customColumnsCount;

    // 计算比率
    const completionRate = totalTasks
      ? Math.round((completedCount / totalTasks) * 100)
      : 0;
    const todoRate = totalTasks
      ? Math.round((todoCount / totalTasks) * 100)
      : 0;
    const inProgressRate = totalTasks
      ? Math.round((inProgressCount / totalTasks) * 100)
      : 0;
    const customRate = totalTasks
      ? Math.round((customColumnsCount / totalTasks) * 100)
      : 0;

    return {
      todoCount,
      inProgressCount,
      completedCount,
      customColumns,
      customColumnsCount,
      totalTasks,
      completionRate,
      todoRate,
      inProgressRate,
      customRate,
    };
  }, [currentEvent]);

  // 使用解构简化访问
  const {
    todoCount,
    inProgressCount,
    completedCount,
    customColumns,
    customColumnsCount,
    totalTasks,
    completionRate,
    todoRate,
    inProgressRate,
    customRate,
  } = taskStats;

  // 仅在组件挂载时初始化拖拽功能
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let startPos = { x: 0, y: 0 };
    let startMousePos = { x: 0, y: 0 };
    let isDraggingCard = false;

    const handleMouseDown = (e) => {
      // 确保只从标题区域开始拖拽
      if (!e.target.closest(".card-header")) return;

      e.preventDefault();
      isDraggingCard = true;
      setIsDragging(true);

      // 获取当前卡片位置
      const rect = card.getBoundingClientRect();
      startPos = { x: rect.left, y: rect.top };
      startMousePos = { x: e.clientX, y: e.clientY };

      // 使用CSS来移动元素而不是React状态
      card.style.transition = "none";
      card.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e) => {
      if (!isDraggingCard) return;

      const dx = e.clientX - startMousePos.x;
      const dy = e.clientY - startMousePos.y;

      // 直接通过DOM操作设置位置，避免React渲染循环
      card.style.left = `${Math.max(0, startPos.x + dx)}px`;
      card.style.top = `${Math.max(0, startPos.y + dy)}px`;
    };

    const handleMouseUp = () => {
      if (!isDraggingCard) return;

      isDraggingCard = false;
      setIsDragging(false);

      // 获取当前位置并更新React状态（只在拖拽结束时更新一次状态）
      const rect = card.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });

      card.style.transition = "box-shadow 0.2s ease";
      card.style.cursor = "grab";
      document.body.style.userSelect = "";
    };

    // 确保在鼠标离开窗口时也能捕获释放事件
    const handleMouseLeave = () => {
      if (isDraggingCard) {
        handleMouseUp();
      }
    };

    card.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    // 清理事件监听器
    return () => {
      card.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 缓存Tab内容以避免不必要的重新渲染
  const tabItems = useMemo(
    () => [
      {
        key: "statistics",
        label: "基本统计",
        children: (
          <>
            <div className="flex justify-between">
              <div>
                <Statistic
                  title="待办任务"
                  value={todoCount}
                  prefix={
                    <InboxOutlined
                      style={{
                        color: currentEvent.columnColors["To do"] || "#faad14",
                      }}
                    />
                  }
                />
              </div>
              <div>
                <Statistic
                  title="进行中"
                  value={inProgressCount}
                  prefix={
                    <SyncOutlined
                      spin
                      className="scale-90"
                      style={{
                        color:
                          currentEvent.columnColors["In progress"] || "#1677ff",
                      }}
                    />
                  }
                />
              </div>
              <div>
                <Statistic
                  title="已完成"
                  value={completedCount}
                  prefix={
                    <CheckCircleOutlined
                      className="scale-90"
                      style={{
                        color:
                          currentEvent.columnColors["Completed"] || "#52c41a",
                      }}
                    />
                  }
                />
              </div>
              <div>
                <Statistic
                  title="总任务数"
                  value={totalTasks}
                  prefix={
                    <FileTextOutlined
                      className="scale-90"
                      style={{
                        color: "#1890ff",
                      }}
                    />
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <span>完成率</span>
              <Progress
                percent={completionRate}
                status={completionRate === 100 ? "success" : "active"}
              />
            </div>

            {customColumns.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">自定义列任务</h4>
                <Row gutter={16}>
                  {customColumns.map((column) => (
                    <Col span={4} key={column}>
                      <Statistic
                        title={column}
                        value={
                          currentEvent[column]?.filter(
                            (task) => task && task.id
                          )?.length || 0
                        }
                        valueStyle={{ fontSize: "16px" }}
                        prefix={
                          <div
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{
                              backgroundColor:
                                currentEvent.columnColors[column],
                            }}
                          />
                        }
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </>
        ),
      },
      {
        key: "distribution",
        label: "任务分布",
        children: (
          <>
            <div className="mb-4">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div className="flex justify-between">
                  <span>待办任务</span>
                  <span>{todoRate}%</span>
                </div>
                <Progress
                  percent={todoRate}
                  showInfo={false}
                  strokeColor={currentEvent.columnColors["To do"] || "#faad14"}
                />

                <div className="flex justify-between">
                  <span>进行中</span>
                  <span>{inProgressRate}%</span>
                </div>
                <Progress
                  percent={inProgressRate}
                  showInfo={false}
                  strokeColor={
                    currentEvent.columnColors["In progress"] || "#1677ff"
                  }
                />

                <div className="flex justify-between">
                  <span>已完成</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress
                  percent={completionRate}
                  showInfo={false}
                  strokeColor={
                    currentEvent.columnColors["Completed"] || "#52c41a"
                  }
                />

                {customRate > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>自定义列</span>
                      <span>{customRate}%</span>
                    </div>
                    <Progress
                      percent={customRate}
                      showInfo={false}
                      strokeColor="#1890ff"
                    />
                  </>
                )}
              </Space>
            </div>

            <div className="rounded-lg bg-gray-50 !p-2  mt-2">
              <h4 className="text-sm font-medium mb-2">任务状态概览</h4>
              <div className="flex items-center gap-4 flex-wrap">
                {todoCount > 0 && (
                  <Badge
                    color={currentEvent.columnColors["To do"] ?? "#faad14"}
                    text={`待办 (${todoCount})`}
                  />
                )}
                {inProgressCount > 0 && (
                  <Badge
                    color={
                      currentEvent.columnColors["In progress"] ?? "#1677ff"
                    }
                    text={`进行中 (${inProgressCount})`}
                  />
                )}
                {completedCount > 0 && (
                  <Badge
                    color={currentEvent.columnColors["Completed"] ?? "#52c41a"}
                    text={`已完成 (${completedCount})`}
                  />
                )}
                {customColumns.map((column) => (
                  <Badge
                    key={column}
                    color={currentEvent.columnColors[column]}
                    text={`${column} (${
                      currentEvent[column]?.filter((task) => task && task.id)
                        ?.length || 0
                    })`}
                  />
                ))}
              </div>
            </div>
          </>
        ),
      },
    ],
    [
      todoCount,
      inProgressCount,
      completedCount,
      customColumns,
      totalTasks,
      completionRate,
      todoRate,
      inProgressRate,
      customRate,
      currentEvent.columnColors,
    ]
  );

  // 初始样式，将使用DOM直接操作进行拖拽
  const initialStyle = {
    position: "fixed",
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 50,
    width: "30vw",
    maxWidth: "600px",
    minWidth: "400px",
    boxShadow: isDragging
      ? "0 5px 15px rgba(0,0,0,0.3)"
      : "0 3px 10px rgba(0,0,0,0.2)",
    transition: "box-shadow 0.2s ease",
    willChange: "transform, left, top",
    cursor: "grab",
  };

  return (
    <Card
      ref={cardRef}
      style={initialStyle}
      styles={{
        header: {
          background: "#fafafa",
          padding: "12px 16px",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "grab",
        },
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          overflowX: "hidden",
        },
      }}
      title={
        <div className="flex justify-between items-center card-header">
          <span>事件看板(可拖拽)</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setIsTaskStatisticsOpen(false)}
          />
        </div>
      }
    >
      <Tabs items={tabItems} defaultActiveKey="statistics" />
    </Card>
  );
};

export default TaskStatistics;
