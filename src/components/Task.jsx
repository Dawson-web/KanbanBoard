import { Card, Typography, Button, Modal, Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const Task = ({ name, details, id, provided, handleUpdate, handleRemove }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showEditModal = () => {
    form.setFieldsValue({ name, details });
    setIsEditModalOpen(true);
  };

  const handleEditOk = () => {
    form.validateFields().then(values => {
      handleUpdate(id, values.name, values.details);
      setIsEditModalOpen(false);
      form.resetFields();
    });
  };

  const showDeleteModal = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = (e) => {
    handleRemove(id, e);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="mb-3"
      >
        <Card
          size="small"
          className="bg-white hover:shadow-md transition-all duration-300 border border-gray-200"
          bodyStyle={{ padding: '12px 16px' }}
          actions={[
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={showEditModal}
            />,
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={showDeleteModal}
            />
          ]}
        >
          <Text strong className="block mb-2 text-base">{name}</Text>
          <Paragraph type="secondary" className="!mb-0 text-sm" ellipsis={{ rows: 2 }}>
            {details}
          </Paragraph>
        </Card>
      </div>

      <Modal
        title="Edit Task"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name, details }}
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

      <Modal
        title="Delete Task"
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this task?</p>
      </Modal>
    </>
  );
};

export default Task;
