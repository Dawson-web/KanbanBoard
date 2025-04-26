import React, { useCallback, useState } from 'react';
import Column from './Column';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layout, Typography, Modal, Form, Input, FloatButton } from 'antd';
import { DeleteOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const TaskBox = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleRemove = useCallback(() => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除这个事件吗？此操作不可恢复。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        // update events
        setEvents((prev) => {
          const result = prev.filter((item) => item.title != currentEvent.title);
          // if event is empty
          if (!result.length) {
            // init the event
            const initEvent = [
              {
                title: '新建事件',
                columnColors: {
                  'To do': '#faad14',
                  'In progress': '#1677ff',
                  'Completed': '#52c41a'
                },
                ['To do']: [],
                ['In progress']: [],
                ['Completed']: [],
              },
            ];
            setEvents(initEvent);
          } else {
            // set the first event as current
            setCurrentEvent(result[0]);
          }
          return result;
        });
      }
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
    if (type === 'COLUMN') {
      setEvents(prev => 
        prev.map(event => {
          if (event.title === currentEvent.title) {
            const newEvent = { title: event.title, columnColors: event.columnColors };
            const columns = Object.keys(event).filter(key => 
              Array.isArray(event[key]) && key !== 'columnColors'
            );
            
            // 重新排序列
            const orderedColumns = [...columns];
            const [movedColumn] = orderedColumns.splice(source.index, 1);
            orderedColumns.splice(destination.index, 0, movedColumn);
            
            // 按新顺序重建事件对象
            orderedColumns.forEach(columnTitle => {
              newEvent[columnTitle] = event[columnTitle];
            });
            
            return newEvent;
          }
          return event;
        })
      );
      
      // 同步更新 currentEvent
      setCurrentEvent(prev => {
        const newEvent = { title: prev.title, columnColors: prev.columnColors };
        const columns = Object.keys(prev).filter(key => 
          Array.isArray(prev[key]) && key !== 'columnColors'
        );
        
        const orderedColumns = [...columns];
        const [movedColumn] = orderedColumns.splice(source.index, 1);
        orderedColumns.splice(destination.index, 0, movedColumn);
        
        orderedColumns.forEach(columnTitle => {
          newEvent[columnTitle] = prev[columnTitle];
        });
        
        return newEvent;
      });
      return;
    }

    // 处理任务的拖动
    if (type === 'TASK') {
      const taskId = draggableId.replace('task-', '');
      
      setEvents((prev) =>
        prev.map((event) => {
          if (event.title === currentEvent.title) {
            const sourceList = [...event[source.droppableId]];
            const destList = source.droppableId === destination.droppableId
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
              };
            }
          }
          return event;
        })
      );

      // 同步更新 currentEvent
      setCurrentEvent(prev => {
        const sourceList = [...prev[source.droppableId]];
        const destList = source.droppableId === destination.droppableId
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
          return {
            ...prev,
            [source.droppableId]: sourceList,
            [destination.droppableId]: destList,
          };
        }
      });
    }
  };

  const handleAddColumn = (values) => {
    const { columnTitle } = values;
    
    // 先更新 currentEvent，确保 UI 立即响应
    setCurrentEvent(prev => {
      // 检查列名是否已存在
      if (prev[columnTitle]) {
        Modal.error({
          title: '添加失败',
          content: '列名已存在！'
        });
        return prev;
      }
      return {
        ...prev,
        [columnTitle]: [], // 新列的任务列表
        columnColors: {
          ...prev.columnColors,
          [columnTitle]: '#1890ff' // 默认蓝色
        }
      };
    });

    // 然后更新 events
    setEvents(prev => 
      prev.map(event => {
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
              [columnTitle]: '#1890ff' // 默认蓝色
            }
          };
        }
        return event;
      })
    );

    setIsAddColumnModalOpen(false);
    form.resetFields();
  };

  const handleColumnDelete = (columnTitle) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.title === currentEvent.title) {
          const { [columnTitle]: deletedColumn, ...rest } = event;
          const { columnColors } = event;
          delete columnColors[columnTitle];
          return {
            ...rest,
            columnColors
          };
        }
        return event;
      })
    );

    // 同步更新 currentEvent
    setCurrentEvent(prev => {
      const { [columnTitle]: deletedColumn, ...rest } = prev;
      const { columnColors } = prev;
      delete columnColors[columnTitle];
      return {
        ...rest,
        columnColors
      };
    });
  };

  const handleColumnTitleChange = (oldTitle, newTitle) => {
    if (oldTitle === newTitle) return;

    // 先更新 currentEvent，确保 UI 立即响应
    setCurrentEvent(prev => {
      const newEvent = { 
        title: prev.title,
        columnColors: {
          ...prev.columnColors,
          [newTitle]: prev.columnColors[oldTitle]
        }
      };
      delete newEvent.columnColors[oldTitle];

      // 按顺序复制所有列
      Object.keys(prev).forEach(key => {
        if (key === 'title' || key === 'columnColors') return;
        if (key === oldTitle) {
          newEvent[newTitle] = [...prev[oldTitle]];
        } else {
          newEvent[key] = [...prev[key]];
        }
      });

      return newEvent;
    });

    // 然后更新 events
    setEvents(prev => 
      prev.map(event => {
        if (event.title === currentEvent.title) {
          // 检查新列名是否已存在
          if (event[newTitle] && oldTitle !== newTitle) {
            Modal.error({
              title: '重命名失败',
              content: '列名已存在！'
            });
            return event;
          }

          const newEvent = { 
            title: event.title,
            columnColors: {
              ...event.columnColors,
              [newTitle]: event.columnColors[oldTitle]
            }
          };
          delete newEvent.columnColors[oldTitle];

          // 按顺序复制所有列
          Object.keys(event).forEach(key => {
            if (key === 'title' || key === 'columnColors') return;
            if (key === oldTitle) {
              newEvent[newTitle] = [...event[oldTitle]];
            } else {
              newEvent[key] = [...event[key]];
            }
          });

          return newEvent;
        }
        return event;
      })
    );
  };

  // 获取当前事件的所有列
  const columns = currentEvent ? 
    Object.keys(currentEvent).filter(key => 
      Array.isArray(currentEvent[key]) && key !== 'columnColors'
    ) : [];

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="flex items-center !bg-white px-8 py-4 border-b">
        <Title level={2} className="!mb-0">All Tasks</Title>
      </Header>
      <Content className="p-6 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div 
                className="flex gap-6 min-w-max"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map((columnTitle, index) => (
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

        <FloatButton.Group
          trigger="hover"
          icon={<SettingOutlined />}
          type="primary"
          style={{ right: 24 }}
        >
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
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddColumn}
          >
            <Form.Item
              name="columnTitle"
              label="列名称"
              rules={[
                { required: true, message: '请输入列名称！' },
                { max: 10, message: '列名称不能超过10个字符！' }
              ]}
            >
              <Input placeholder="请输入列名称" maxLength={10} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default TaskBox;
