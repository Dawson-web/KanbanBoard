import React, { useCallback } from 'react';
import Column from './Column';
import { DragDropContext } from '@hello-pangea/dnd';
import { Layout, Typography, Button, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const TaskBox = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
  const handleRemove = useCallback(() => {
    if (confirm('You really want to remove it?')) {
      // update events
      setEvents((prev) => {
        const result = prev.filter((item) => item.title != currentEvent.title);
        // if event is empty
        if (!result.length) {
          // init the event
          const initEvent = [
            {
              title: 'Add a new Event',
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
  }, [events, setEvents, currentEvent, setCurrentEvent]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const curEvent = events.find((item) => item.title === currentEvent.title);
    const taskCopy = curEvent[source.droppableId][source.index];
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          let eventCopy = { ...event };
          // Remove from source
          const taskListSource = event[source.droppableId];
          taskListSource.splice(source.index, 1);
          eventCopy = { ...event, [source.droppableId]: taskListSource };
          // Add to destination
          const taskListDes = event[destination.droppableId];
          taskListDes.splice(destination.index, 0, taskCopy);
          eventCopy = { ...event, [destination.droppableId]: taskListDes };
          return eventCopy;
        } else {
          return event;
        }
      })
    );
  }, [events, setEvents, currentEvent]);

  return (
    <Layout className="min-h-screen bg-white ">
      <Header className="flex items-center justify-between !bg-white px-8 py-4 border-b">
        <Space>
          <Title level={2} className="!mb-0 ">All Tasks</Title>
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Remove Event
          </Button>
        </Space>
      </Header>
      <Content className="p-6">
        <DragDropContext onDragEnd={(result) => handleDragEnd(result)}>
          <div className="grid grid-cols-3 gap-6">
            {['To do', 'In progress', 'Completed'].map(tag => (
              <Column
                key={tag}
                tag={tag}
                events={events}
                setEvents={setEvents}
                currentEvent={currentEvent}
              />
            ))}
          </div>
        </DragDropContext>
      </Content>
    </Layout>
  );
};

export default TaskBox;
