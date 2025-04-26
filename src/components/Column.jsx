import AddTaskButton from './AddTaskButton';
import Task from './Task';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuid } from 'uuid';
import { Card, Typography, Modal, Form, Input } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { TextArea } = Input;

const Column = ({ tag, currentEvent, events, setEvents }) => {
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAdd = (values) => {
    setEvents((prev) => {
      const arrCopy = [...prev];
      const index = prev.findIndex(
        (event) => event.title === currentEvent.title
      );
      const eventCopy = arrCopy[index];
      arrCopy.splice(index, 1, {
        ...eventCopy,
        [tag]: [
          ...eventCopy[tag],
          { name: values.name, id: uuid(), details: values.details },
        ],
      });
      return arrCopy;
    });
    setIsAddModalOpen(false);
    form.resetFields();
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          const taskList = event[tag];
          const index = taskList.findIndex((item) => item.id === id);
          taskList.splice(index, 1);
          return { ...event, [tag]: [...taskList] };
        } else {
          return event;
        }
      })
    );
  };

  const handleUpdate = (id, name, details) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.title === currentEvent.title) {
          const taskList = event[tag];
          const index = taskList.findIndex((item) => item.id === id);
          const updatedTask = {
            ...taskList[index],
            name,
            details,
          };
          taskList.splice(index, 1);
          return { ...event, [tag]: [...taskList, updatedTask] };
        } else {
          return event;
        }
      })
    );
  };

  return (
    <>
      <Card 
        title={<Title level={4} className="!mb-0">{tag}</Title>}
        className="bg-gray-50"
        extra={<AddTaskButton handleClick={showAddModal} />}
      >
        <Droppable droppableId={tag}>
          {(provided, snapshot) => {
            return (
              <div
                className="min-h-[30px] max-h-[calc(100vh-250px)] overflow-auto"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {events
                  .find((event) => event.title === currentEvent.title)
                  ?.[tag].map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Task
                          name={item.name}
                          details={item.details}
                          id={item.id}
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
            );
          }}
        </Droppable>
      </Card>

      <Modal
        title="Add New Task"
        open={isAddModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        okText="Add"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please input task name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="details"
            label="Task Details"
            rules={[{ required: true, message: 'Please input task details!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Column;
