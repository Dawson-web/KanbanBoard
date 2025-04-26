import AddTaskButton from './AddTaskButton';
import Task from './Task';
import ColumnTitleEditor from './ColumnTitleEditor';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuid } from 'uuid';
import { Card, Typography, Modal, Form, Input, Popover } from 'antd';
import { useState, useCallback, useMemo, memo } from 'react';
import { CirclePicker } from 'react-color';

const { TextArea } = Input;

const Column = memo(({ 
  tag, 
  currentEvent, 
  events, 
  setEvents,
  onColumnDelete,
  onColumnTitleChange,
  dragHandleProps,
  setCurrentEvent
}) => {
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAdd = useCallback((values) => {
    const newTask = { 
      name: values.name, 
      id: uuid(), 
      details: values.details
    };

    setEvents((prev) => {
      const arrCopy = [...prev];
      const index = prev.findIndex(
        (event) => event.title === currentEvent.title
      );
      if (index === -1) return prev;
      
      const eventCopy = arrCopy[index];
      arrCopy.splice(index, 1, {
        ...eventCopy,
        [tag]: [...eventCopy[tag], newTask],
      });
      return arrCopy;
    });

    setCurrentEvent(prev => ({
      ...prev,
      [tag]: [...prev[tag], newTask]
    }));

    setIsAddModalOpen(false);
    form.resetFields();
  }, [currentEvent.title, tag, setEvents, setCurrentEvent, form]);

  const handleRemove = useCallback((id, e) => {
    if (!id) return;
    e.stopPropagation();
    
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          const taskList = [...event[tag]].filter(task => task && task.id);
          const index = taskList.findIndex((item) => item && item.id === id);
          if (index === -1) return event;
          
          taskList.splice(index, 1);
          return { ...event, [tag]: taskList };
        }
        return event;
      })
    );

    setCurrentEvent(prev => {
      const taskList = [...prev[tag]].filter(task => task && task.id);
      const index = taskList.findIndex((item) => item && item.id === id);
      if (index === -1) return prev;
      
      taskList.splice(index, 1);
      return { ...prev, [tag]: taskList };
    });
  }, [currentEvent.title, tag, setEvents, setCurrentEvent]);

  const handleUpdate = useCallback((id, name, details) => {
    if (!id) return;
    
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          const taskList = [...event[tag]].filter(task => task && task.id);
          const index = taskList.findIndex((item) => item && item.id === id);
          if (index === -1) return event;
          
          taskList[index] = {
            ...taskList[index],
            name,
            details,
          };
          return { ...event, [tag]: taskList };
        }
        return event;
      })
    );

    setCurrentEvent(prev => {
      const taskList = [...prev[tag]].filter(task => task && task.id);
      const index = taskList.findIndex((item) => item && item.id === id);
      if (index === -1) return prev;
      
      taskList[index] = {
        ...taskList[index],
        name,
        details,
      };
      return { ...prev, [tag]: taskList };
    });
  }, [currentEvent.title, tag, setEvents, setCurrentEvent]);

  const handleColumnColorChange = useCallback((color) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.title === currentEvent.title) {
          return {
            ...event,
            columnColors: {
              ...event.columnColors,
              [tag]: color.hex
            }
          };
        }
        return event;
      })
    );

    setCurrentEvent(prev => ({
      ...prev,
      columnColors: {
        ...prev.columnColors,
        [tag]: color.hex
      }
    }));
  }, [currentEvent.title, tag, setEvents, setCurrentEvent]);

  const colorPicker = useMemo(() => (
    <CirclePicker
      color={currentEvent.columnColors[tag]}
      onChange={handleColumnColorChange}
    />
  ), [currentEvent.columnColors[tag], handleColumnColorChange]);

  // 获取当前列的任务列表并过滤掉无效值
  const tasks = useMemo(() => 
    (currentEvent?.[tag] || []).filter(task => task && task.id),
    [currentEvent, tag]
  );

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
              canDelete={!['To do', 'In progress', 'Completed'].includes(tag)}
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
                  backgroundColor: currentEvent.columnColors[tag]
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
            transition: 'border-color 0.3s'
          },
          body: { 
            padding: '16px'
          }
        }}
      >
        <Droppable droppableId={tag} type="TASK">
          {(provided, snapshot) => (
            <div
              className={`min-h-[30px] max-h-[calc(100vh-250px)] overflow-auto rounded-lg p-2 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks.map((item, index) => (
                <Draggable
                  key={`task-${item.id}`}
                  draggableId={`task-${item.id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Task
                      name={item.name}
                      details={item.details}
                      id={item.id}
                      color={currentEvent.columnColors[tag]}
                      provided={provided}
                      snapshot={snapshot}
                      handleRemove={handleRemove}
                      handleUpdate={handleUpdate}
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
        title="新建任务"
        open={isAddModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        okText="添加"
        cancelText="取消"
        className="!w-[400px]"
        maskClosable={false}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称！' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            name="details"
            label="任务详情"
            rules={[{ required: true, message: '请输入任务详情！' }]}
          >
            <TextArea rows={4} placeholder="请输入任务详情" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

export default Column;
