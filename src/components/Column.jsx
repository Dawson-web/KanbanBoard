import AddTaskButton from "./AddTaskButton";
import Task from "./Task";
import ColumnTitleEditor from "./ColumnTitleEditor";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import {
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Popover,
  Space,
  Select,
  DatePicker,
} from "antd";
import { useState, useCallback, useMemo, memo } from "react";
import { CirclePicker } from "react-color";
import EventType from "../types/event";

const { TextArea } = Input;

const Column = memo(
  ({
    tag,
    currentEvent,
    events,
    setEvents,
    onColumnDelete,
    onColumnTitleChange,
    dragHandleProps,
    setCurrentEvent,
    filterTasks = (tasks) => tasks,
  }) => {
    const [form] = Form.useForm();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const showAddModal = useCallback(() => {
      setIsAddModalOpen(true);
    }, []);

    const handleAdd = useCallback(
      (values) => {
        const newTask = {
          name: values.name,
          id: uuid(),
          details: values.details,
          priority: values.priority || "medium",
          dueDate: values.dueDate ? values.dueDate.valueOf() : null,
        };

        setEvents((prev) =>
          prev.map((event) => {
            if (event.title === currentEvent.title) {
              return {
                ...event,
                [tag]: [...event[tag], newTask],
                history: [
                  ...event.history,
                  {
                    type: EventType.CREATETASK,
                    date: new Date().getTime(),
                    desc: `创建任务-${values.name}`,
                    details: `创建任务-${values.name}到${tag}列`,
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
          [tag]: [...prev[tag], newTask],
          history: [
            ...prev.history,
            {
              type: EventType.CREATETASK,
              date: new Date().getTime(),
              desc: `创建任务-${values.name}`,
              details: `创建任务-${values.name}到${tag}列`,
              user: null,
            },
          ],
        }));

        setIsAddModalOpen(false);
        form.resetFields();
      },
      [currentEvent.title, tag, setEvents, setCurrentEvent, form]
    );

    const handleRemove = useCallback(
      (id, e) => {
        if (!id) return;
        e.stopPropagation();

        const taskToRemove = currentEvent[tag].find((task) => task.id === id);

        setEvents((prev) =>
          prev.map((event) => {
            if (event.title === currentEvent.title) {
              const taskList = [...event[tag]].filter(
                (task) => task && task.id
              );
              const index = taskList.findIndex(
                (item) => item && item.id === id
              );
              if (index === -1) return event;

              taskList.splice(index, 1);
              return {
                ...event,
                [tag]: taskList,
                history: [
                  ...event.history,
                  {
                    type: EventType.DELETETASK,
                    date: new Date().getTime(),
                    desc: `删除任务-${taskToRemove.name}`,
                    details: `从${tag}列删除任务-${taskToRemove.name}`,
                    user: null,
                  },
                ],
              };
            }
            return event;
          })
        );

        setCurrentEvent((prev) => {
          const taskList = [...prev[tag]].filter((task) => task && task.id);
          const index = taskList.findIndex((item) => item && item.id === id);
          if (index === -1) return prev;

          taskList.splice(index, 1);
          return {
            ...prev,
            [tag]: taskList,
            history: [
              ...prev.history,
              {
                type: EventType.DELETETASK,
                date: new Date().getTime(),
                desc: `删除任务-${taskToRemove.name}`,
                details: `从${tag}列删除任务-${taskToRemove.name}`,
                user: null,
              },
            ],
          };
        });
      },
      [currentEvent, tag, setEvents, setCurrentEvent]
    );

    const handleUpdate = useCallback(
      (id, name, details, priority, dueDate) => {
        if (!id) return;

        const oldTask = currentEvent[tag].find((task) => task.id === id);

        setEvents((prev) =>
          prev.map((event) => {
            if (event.title === currentEvent.title) {
              const taskList = [...event[tag]].filter(
                (task) => task && task.id
              );
              const index = taskList.findIndex(
                (item) => item && item.id === id
              );
              if (index === -1) return event;

              taskList[index] = {
                ...taskList[index],
                name,
                details,
                priority,
                dueDate,
              };
              return {
                ...event,
                [tag]: taskList,
                history: [
                  ...event.history,
                  {
                    type: EventType.EDITTASK,
                    date: new Date().getTime(),
                    desc: `编辑任务-${oldTask.name}`,
                    details: `在${tag}列编辑任务-从"${oldTask.name}"改为"${name}"`,
                    user: null,
                  },
                ],
              };
            }
            return event;
          })
        );

        setCurrentEvent((prev) => {
          const taskList = [...prev[tag]].filter((task) => task && task.id);
          const index = taskList.findIndex((item) => item && item.id === id);
          if (index === -1) return prev;

          taskList[index] = {
            ...taskList[index],
            name,
            details,
            priority,
            dueDate,
          };
          return {
            ...prev,
            [tag]: taskList,
            history: [
              ...prev.history,
              {
                type: EventType.EDITTASK,
                date: new Date().getTime(),
                desc: `编辑任务-${oldTask.name}`,
                details: `在${tag}列编辑任务-从"${oldTask.name}"改为"${name}"`,
                user: null,
              },
            ],
          };
        });
      },
      [currentEvent, tag, setEvents, setCurrentEvent]
    );

    const handleColumnColorChange = useCallback(
      (color) => {
        setEvents((prev) =>
          prev.map((event) => {
            if (event.title === currentEvent.title) {
              return {
                ...event,
                columnColors: {
                  ...event.columnColors,
                  [tag]: color.hex,
                },
              };
            }
            return event;
          })
        );

        setCurrentEvent((prev) => ({
          ...prev,
          columnColors: {
            ...prev.columnColors,
            [tag]: color.hex,
          },
        }));
      },
      [currentEvent.title, tag, setEvents, setCurrentEvent]
    );

    const colorPicker = useMemo(
      () => (
        <CirclePicker
          color={currentEvent.columnColors[tag]}
          onChange={handleColumnColorChange}
        />
      ),
      [currentEvent.columnColors[tag], handleColumnColorChange]
    );

    // 获取当前列的任务列表并过滤掉无效值，然后应用任务过滤
    const tasks = useMemo(() => {
      const columnTasks = (currentEvent?.[tag] || []).filter(
        (task) => task && task.id
      );
      return filterTasks(columnTasks);
    }, [currentEvent, tag, filterTasks]);

    return (
      <>
        <Card
          title={
            <div
              className="flex items-center gap-2 cursor-move"
              {...dragHandleProps}
            >
              <ColumnTitleEditor
                title={tag}
                color={currentEvent.columnColors[tag]}
                onTitleChange={(newTitle) => onColumnTitleChange(tag, newTitle)}
                onDelete={() => onColumnDelete(tag)}
                canDelete={!["To do", "In progress", "Completed"].includes(tag)}
              />
              <Popover
                content={colorPicker}
                title="选择列颜色"
                trigger="click"
                placement="bottom"
              >
                <div
                  className="ml-2 w-3 h-3 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 transition-all"
                  style={{
                    backgroundColor: currentEvent.columnColors[tag],
                  }}
                />
              </Popover>
            </div>
          }
          className="bg-gray-50 hover:shadow-md transition-all duration-300"
          extra={<AddTaskButton handleClick={showAddModal} />}
          styles={{
            header: {
              borderLeft: `4px solid ${currentEvent.columnColors[tag]}`,
              transition: "border-color 0.3s",
            },
            body: {
              padding: "16px",
            },
          }}
        >
          <Droppable droppableId={tag} type="TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[30px] px-1 py-2 overflow-auto rounded-md pb-12 ${
                  snapshot.isDraggingOver
                    ? `bg-${currentEvent.columnColors[tag]}/5`
                    : ""
                }`}
              >
                {tasks.map((task, index) => (
                  <Draggable
                    key={`task-${task.id}`}
                    draggableId={`task-${task.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Task
                        name={task.name}
                        details={task.details}
                        id={task.id}
                        color={currentEvent.columnColors[tag]}
                        provided={provided}
                        snapshot={snapshot}
                        handleRemove={handleRemove}
                        handleUpdate={handleUpdate}
                        priority={task.priority || "medium"}
                        dueDate={task.dueDate}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Card>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentEvent.columnColors[tag] }}
              />
              <span>添加新任务到 {tag}</span>
            </div>
          }
          open={isAddModalOpen}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsAddModalOpen(false);
            form.resetFields();
          }}
          okText="添加"
          cancelText="取消"
          maskClosable={false}
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleAdd}>
            <Form.Item
              name="name"
              label="任务名称"
              rules={[{ required: true, message: "请输入任务名称！" }]}
            >
              <Input placeholder="请输入任务名称" maxLength={50} showCount />
            </Form.Item>
            <Form.Item
              name="details"
              label="任务详情"
              rules={[{ required: true, message: "请输入任务详情！" }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入任务详情"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Space style={{ display: "flex", width: "100%" }}>
              <Form.Item
                name="priority"
                label="优先级"
                style={{ width: "50%" }}
                initialValue="medium"
              >
                <Select placeholder="请选择优先级">
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="截止日期"
                style={{ width: "50%" }}
              >
                <DatePicker
                  showTime
                  placeholder="选择截止日期"
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Space>
          </Form>
        </Modal>
      </>
    );
  }
);

export default Column;
