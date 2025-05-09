import React, { useCallback, useState, useRef, useEffect } from "react";
import Column from "./Column";
import TaskStatistics from "./TaskStatistics";
import EventTimeline from "./EventTimeline";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Layout,
  Typography,
  Modal,
  Form,
  Input,
  FloatButton,
  Button,
  Row,
  Col,
  Select,
  Space,
  Divider,
  DatePicker,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  EditOutlined,
  BarChartOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import EventType from "../types/event";
import useScrollDragble from "../hooks/ScrollDragble";
import dayjs from "dayjs";
import FilterMenu from "./FilterMenu";

const { Content } = Layout;

const TaskBox = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isTaskStatisticsOpen, setIsTaskStatisticsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [form] = Form.useForm();
  const [editEventForm] = Form.useForm();

  // 搜索和过滤状态
  const [searchText, setSearchText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [dateRangeFilter, setDateRangeFilter] = useState(null);
  const [dueDateOption, setDueDateOption] = useState("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // 拖拽
  const contentRef = useScrollDragble("MAIN");

  const handleRemove = useCallback(() => {
    Modal.confirm({
      title: "删除确认",
      content: "确定要删除这个事件吗？此操作不可恢复。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        // 在删除前添加历史记录
        const eventToDelete = currentEvent.title;

        // update events
        setEvents((prev) => {
          const result = prev.filter(
            (item) => item.title != currentEvent.title
          );
          // if event is empty
          if (!result.length) {
            // init the event
            const initEvent = [
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
            ];
            setEvents(initEvent);
          } else {
            // 在第一个事件中添加删除记录
            result[0].history.push({
              type: EventType.DELETEEVENT,
              date: new Date().getTime(),
              desc: `删除事件-${eventToDelete}`,
              details: `删除事件-${eventToDelete}`,
              user: null,
            });
            // set the first event as current
            setCurrentEvent(result[0]);
          }
          return result;
        });
      },
    });
  }, [events, setEvents, currentEvent, setCurrentEvent]);

  const onDragEnd = (result) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 处理列的拖动
    if (type === "COLUMN") {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.title === currentEvent.title) {
            const newEvent = {
              title: event.title,
              columnColors: event.columnColors,
            };
            const columns = Object.keys(event).filter(
              (key) => Array.isArray(event[key]) && key !== "columnColors"
            );

            // 重新排序列
            const orderedColumns = [...columns];
            const [movedColumn] = orderedColumns.splice(source.index, 1);
            orderedColumns.splice(destination.index, 0, movedColumn);

            // 按新顺序重建事件对象
            orderedColumns.forEach((columnTitle) => {
              newEvent[columnTitle] = event[columnTitle];
            });

            return newEvent;
          }
          return event;
        })
      );

      // 同步更新 currentEvent
      setCurrentEvent((prev) => {
        const newEvent = { title: prev.title, columnColors: prev.columnColors };
        const columns = Object.keys(prev).filter(
          (key) => Array.isArray(prev[key]) && key !== "columnColors"
        );

        const orderedColumns = [...columns];
        const [movedColumn] = orderedColumns.splice(source.index, 1);
        orderedColumns.splice(destination.index, 0, movedColumn);

        orderedColumns.forEach((columnTitle) => {
          newEvent[columnTitle] = prev[columnTitle];
        });

        newEvent.history = [
          ...prev.history,
          {
            type: EventType.MOVETASK,
            date: new Date().getTime(),
            desc: `移动列-${movedColumn}`,
            details: `移动列-${movedColumn}`,
            user: null,
          },
        ];
        return newEvent;
      });
      return;
    }

    // 处理任务的拖动
    if (type === "TASK") {
      const taskId = draggableId.replace("task-", "");
      const sourceColumnTitle = source.droppableId;
      const destColumnTitle = destination.droppableId;

      setEvents((prev) =>
        prev.map((event) => {
          if (event.title === currentEvent.title) {
            const sourceList = [...event[source.droppableId]];
            const destList =
              source.droppableId === destination.droppableId
                ? sourceList
                : [...event[destination.droppableId]];

            const [removed] = sourceList.splice(source.index, 1);

            if (source.droppableId === destination.droppableId) {
              sourceList.splice(destination.index, 0, removed);
              return {
                ...event,
                [source.droppableId]: sourceList,
              };
            } else {
              destList.splice(destination.index, 0, removed);
              return {
                ...event,
                [source.droppableId]: sourceList,
                [destination.droppableId]: destList,
                history: [
                  ...event.history,
                  {
                    type: EventType.MOVETASK,
                    date: new Date().getTime(),
                    desc: `移动任务-${removed.name}`,
                    details: `移动任务-${removed.name}从${sourceColumnTitle}到${destColumnTitle}`,
                    user: null,
                  },
                ],
              };
            }
          }
          return event;
        })
      );

      // 同步更新 currentEvent
      setCurrentEvent((prev) => {
        const sourceList = [...prev[source.droppableId]];
        const destList =
          source.droppableId === destination.droppableId
            ? sourceList
            : [...prev[destination.droppableId]];

        const [removed] = sourceList.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
          sourceList.splice(destination.index, 0, removed);
          return {
            ...prev,
            [source.droppableId]: sourceList,
          };
        } else {
          destList.splice(destination.index, 0, removed);
          console.log(removed);
          return {
            ...prev,
            [source.droppableId]: sourceList,
            [destination.droppableId]: destList,
            history: [
              ...prev.history,
              {
                type: EventType.MOVETASK,
                date: new Date().getTime(),
                desc: `移动任务-${removed.name}`,
                details: `移动任务-${removed.name}从${sourceColumnTitle}到${destColumnTitle}`,
                user: null,
              },
            ],
          };
        }
      });
    }
  };

  const handleAddColumn = (values) => {
    const { columnTitle } = values;

    // 先更新 currentEvent，确保 UI 立即响应
    setCurrentEvent((prev) => {
      // 检查列名是否已存在
      if (prev[columnTitle]) {
        Modal.error({
          title: "添加失败",
          content: "列名已存在！",
        });
        return prev;
      }
      return {
        ...prev,
        history: [
          ...prev.history,
          {
            type: EventType.CREATECLOUMN,
            date: new Date().getTime(),
            desc: `创建新列-${columnTitle}`,
            details: `创建新列-${columnTitle}`,
            user: null,
          },
        ],
        [columnTitle]: [], // 新列的任务列表
        columnColors: {
          ...prev.columnColors,
          [columnTitle]: "#1890ff", // 默认蓝色
        },
      };
    });

    // 然后更新 events
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          // 检查列名是否已存在
          if (event[columnTitle]) {
            return event;
          }
          return {
            ...event,
            [columnTitle]: [], // 新列的任务列表
            columnColors: {
              ...event.columnColors,
              [columnTitle]: "#1890ff", // 默认蓝色
            },
            history: [
              ...event.history,
              {
                type: EventType.CREATECLOUMN,
                date: new Date().getTime(),
                desc: `创建新列-${columnTitle}`,
                details: `创建新列-${columnTitle}`,
                user: null,
              },
            ],
          };
        }
        return event;
      })
    );

    setIsAddColumnModalOpen(false);
    form.resetFields();
  };

  const handleColumnDelete = (columnTitle) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          const { [columnTitle]: deletedColumn, ...rest } = event;
          const { columnColors } = event;
          delete columnColors[columnTitle];
          return {
            ...rest,
            history: [
              ...event.history,
              {
                type: EventType.DELETECLOUMN,
                date: new Date().getTime(),
                desc: `删除列-${columnTitle}`,
                details: `删除列-${columnTitle}`,
                user: null,
              },
            ],
            columnColors,
          };
        }
        return event;
      })
    );

    // 同步更新 currentEvent
    setCurrentEvent((prev) => {
      const { [columnTitle]: deletedColumn, ...rest } = prev;
      const { columnColors } = prev;
      delete columnColors[columnTitle];
      return {
        ...rest,
        history: [
          ...prev.history,
          {
            type: EventType.DELETECLOUMN,
            date: new Date().getTime(),
            desc: `删除列-${columnTitle}`,
            details: `删除列-${columnTitle}`,
            user: null,
          },
        ],
        columnColors,
      };
    });
  };

  const handleColumnTitleChange = (oldTitle, newTitle) => {
    if (oldTitle === newTitle) return;

    // 先更新 currentEvent，确保 UI 立即响应
    setCurrentEvent((prev) => {
      const newEvent = {
        title: prev.title,
        columnColors: {
          ...prev.columnColors,
          [newTitle]: prev.columnColors[oldTitle],
        },
      };
      delete newEvent.columnColors[oldTitle];

      // 按顺序复制所有列
      Object.keys(prev).forEach((key) => {
        if (key === "title" || key === "columnColors") return;
        if (key === oldTitle) {
          newEvent[newTitle] = [...prev[oldTitle]];
        } else {
          newEvent[key] = [...prev[key]];
        }
      });

      newEvent.history = [
        ...prev.history,
        {
          type: EventType.EDITECLOUMN,
          date: new Date().getTime(),
          desc: `编辑列-${oldTitle}名称`,
          details: `编辑列名称-从"${oldTitle}"改为"${newTitle}"`,
          user: null,
        },
      ];

      return newEvent;
    });

    // 然后更新 events
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          // 检查新列名是否已存在
          if (event[newTitle] && oldTitle !== newTitle) {
            Modal.error({
              title: "重命名失败",
              content: "列名已存在！",
            });
            return event;
          }

          const newEvent = {
            title: event.title,
            columnColors: {
              ...event.columnColors,
              [newTitle]: event.columnColors[oldTitle],
            },
          };
          delete newEvent.columnColors[oldTitle];

          // 按顺序复制所有列
          Object.keys(event).forEach((key) => {
            if (key === "title" || key === "columnColors") return;
            if (key === oldTitle) {
              newEvent[newTitle] = [...event[oldTitle]];
            } else {
              newEvent[key] = [...event[key]];
            }
          });

          newEvent.history = [
            ...event.history,
            {
              type: EventType.EDITECLOUMN,
              date: new Date().getTime(),
              desc: `编辑列-${oldTitle}名称`,
              details: `编辑列名称-从"${oldTitle}"改为"${newTitle}"`,
              user: null,
            },
          ];

          return newEvent;
        }
        return event;
      })
    );
  };

  const handleEditEvent = (values) => {
    const { title } = values;
    if (
      events.find(
        (event) =>
          event.title.toLowerCase() === title.toLowerCase() &&
          event.title !== currentEvent.title
      )
    ) {
      Modal.error({
        title: "修改失败",
        content: "事件名称已存在！",
      });
      return;
    }

    const oldTitle = currentEvent.title;
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          return {
            ...event,
            title,
            history: [
              ...event.history,
              {
                type: EventType.EDITEVENT,
                date: new Date().getTime(),
                desc: `编辑事件-${oldTitle}`,
                details: `编辑事件名称-从"${oldTitle}"改为"${title}"`,
                user: null,
              },
            ],
          };
        }
        return event;
      })
    );

    setCurrentEvent((prev) => ({
      ...prev,
      title,
      history: [
        ...prev.history,
        {
          type: EventType.EDITEVENT,
          date: new Date().getTime(),
          desc: `编辑事件-${oldTitle}`,
          details: `编辑事件名称-从"${oldTitle}"改为"${title}"`,
          user: null,
        },
      ],
    }));

    setIsEditEventModalOpen(false);
    editEventForm.resetFields();
  };

  // 获取当前事件的所有列
  const columns = currentEvent
    ? Object.keys(currentEvent).filter(
        (key) => Array.isArray(currentEvent[key]) && key !== "columnColors"
      )
    : [];

  // 过滤任务的函数
  const filterTasks = useCallback(
    (tasks) => {
      if (!tasks) return [];

      return tasks.filter((task) => {
        if (!task || !task.id) return false;

        // 搜索文本过滤
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const nameMatch = task.name?.toLowerCase().includes(searchLower);
          const detailsMatch = task.details
            ?.toLowerCase()
            .includes(searchLower);

          if (!nameMatch && !detailsMatch) return false;
        }

        // 优先级过滤
        if (
          priorityFilter.length > 0 &&
          !priorityFilter.includes(task.priority || "medium")
        ) {
          return false;
        }

        // 截止日期过滤
        if (dueDateOption !== "all") {
          const today = dayjs().startOf("day");
          const taskDueDate = task.dueDate ? dayjs(task.dueDate) : null;

          if (!taskDueDate) {
            // 如果任务没有截止日期，且我们在筛选有截止日期的任务
            if (dueDateOption !== "none") return false;
          } else {
            // 根据选择的选项进行过滤
            switch (dueDateOption) {
              case "today":
                if (!taskDueDate.isSame(today, "day")) return false;
                break;
              case "week":
                const endOfWeek = dayjs().endOf("week");
                if (!taskDueDate.isBetween(today, endOfWeek, "day", "[]"))
                  return false;
                break;
              case "overdue":
                if (!taskDueDate.isBefore(today, "day")) return false;
                break;
              case "none":
                return false; // 如果选择"无截止日期"但任务有截止日期
              default:
                break;
            }
          }
        }

        // 日期范围过滤
        if (
          dateRangeFilter &&
          dateRangeFilter[0] &&
          dateRangeFilter[1] &&
          task.dueDate
        ) {
          const start = dateRangeFilter[0].startOf("day");
          const end = dateRangeFilter[1].endOf("day");
          const dueDate = dayjs(task.dueDate);

          if (!dueDate.isBetween(start, end, "day", "[]")) return false;
        }

        return true;
      });
    },
    [searchText, priorityFilter, dueDateOption, dateRangeFilter]
  );

  // 检查是否有活跃的过滤器
  const hasActiveFilters =
    searchText ||
    priorityFilter.length > 0 ||
    dueDateOption !== "all" ||
    dateRangeFilter;

  // 清除所有过滤器
  const clearAllFilters = () => {
    setSearchText("");
    setPriorityFilter([]);
    setDateRangeFilter(null);
    setDueDateOption("all");
  };

  return (
    <Layout className="h-screen overflow-hidden flex flex-col">
      <FilterMenu
        searchText={searchText}
        setSearchText={setSearchText}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dueDateOption={dueDateOption}
        setDueDateOption={setDueDateOption}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        isFilterVisible={isFilterVisible}
        setIsFilterVisible={setIsFilterVisible}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      />
      <Content className="px-6 pt-4 overflow-auto flex-grow" ref={contentRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                className="flex gap-6 min-w-max"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns
                  .filter((columnTitle) => columnTitle !== "history")
                  .map((columnTitle, index) => (
                    <Draggable
                      key={`column-${columnTitle}`}
                      draggableId={`column-${columnTitle}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="w-[300px]"
                        >
                          <Column
                            tag={columnTitle}
                            currentEvent={currentEvent}
                            events={events}
                            setEvents={setEvents}
                            setCurrentEvent={setCurrentEvent}
                            onColumnDelete={handleColumnDelete}
                            onColumnTitleChange={handleColumnTitleChange}
                            dragHandleProps={provided.dragHandleProps}
                            filterTasks={filterTasks}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {isTaskStatisticsOpen && (
          <TaskStatistics
            currentEvent={currentEvent}
            isTaskStatisticsOpen={isTaskStatisticsOpen}
            setIsTaskStatisticsOpen={setIsTaskStatisticsOpen}
          />
        )}
        {isTimelineOpen && (
          <EventTimeline
            currentEvent={currentEvent}
            isTimelineOpen={isTimelineOpen}
            setIsTimelineOpen={setIsTimelineOpen}
          />
        )}
        <FloatButton.Group
          trigger="click"
          icon={<SettingOutlined />}
          type="primary"
          style={{ right: 24 }}
        >
          <FloatButton
            icon={<HistoryOutlined />}
            tooltip="时间线"
            onClick={() => setIsTimelineOpen(true)}
          />
          <FloatButton
            icon={<BarChartOutlined />}
            tooltip="事件看板"
            onClick={() => setIsTaskStatisticsOpen(true)}
          />
          <FloatButton
            icon={<PlusOutlined />}
            tooltip="添加新列"
            onClick={() => setIsAddColumnModalOpen(true)}
          />
          <FloatButton
            icon={<DeleteOutlined />}
            tooltip="删除事件"
            onClick={handleRemove}
          />
          <FloatButton
            icon={<EditOutlined />}
            tooltip="编辑事件"
            onClick={() => {
              editEventForm.setFieldsValue({ title: currentEvent.title });
              setIsEditEventModalOpen(true);
            }}
          />
        </FloatButton.Group>

        <Modal
          title="添加新列"
          open={isAddColumnModalOpen}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsAddColumnModalOpen(false);
            form.resetFields();
          }}
          okText="添加"
          cancelText="取消"
          className="!w-[400px]"
          maskClosable={false}
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleAddColumn}>
            <Form.Item
              name="columnTitle"
              label="列名称"
              rules={[
                { required: true, message: "请输入列名称！" },
                { max: 10, message: "列名称不能超过10个字符！" },
              ]}
            >
              <Input placeholder="请输入列名称" maxLength={10} showCount />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="编辑事件"
          open={isEditEventModalOpen}
          onOk={() => editEventForm.submit()}
          onCancel={() => {
            setIsEditEventModalOpen(false);
            editEventForm.resetFields();
          }}
          okText="保存"
          cancelText="取消"
          className="!w-[400px]"
          maskClosable={false}
          centered
        >
          <Form
            form={editEventForm}
            layout="vertical"
            onFinish={handleEditEvent}
            initialValues={{ title: currentEvent.title }}
          >
            <Form.Item
              name="title"
              label="事件名称"
              rules={[
                { required: true, message: "请输入事件名称！" },
                { max: 20, message: "事件名称不能超过20个字符！" },
              ]}
            >
              <Input placeholder="请输入事件名称" maxLength={20} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default TaskBox;
