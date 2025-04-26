import React, { useCallback } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const EventBar = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
  const handleAdd = useCallback(() => {
    const title = prompt('Enter the Title:');
    if (!title) return;
    
    // Prevent Duplicated
    if (events.find((event) => event.title.toLowerCase() === title.toLowerCase())) {
      alert('Event Already Existed');
      return;
    }

    // Add new event
    setEvents((prev) => [
      ...prev,
      {
        title,
        ['To do']: [],
        ['In progress']: [],
        ['Completed']: [],
      },
    ]);
  }, [events, setEvents]);

  return (
    <Sider width={250} className="!bg-white !p-4 border-r h-full ">
      <div className="flex flex-col gap-4">
        <Title level={3} className="!mb-0">.kanban</Title>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block
          size="large"
        >
          New Event
        </Button>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentEvent.title]}
        items={events.map(item => ({
          key: item.title,
          label: item.title,
          onClick: () => setCurrentEvent(item)
        }))}
        className="!border-0 !mt-4"
      />
    </Sider>
  );
};

export default EventBar;
