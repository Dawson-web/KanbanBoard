import { Card, Typography, Button, Modal, Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState, memo } from 'react';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const Task = memo(({ 
  name, 
  details, 
  id, 
  color, 
  provided, 
  snapshot,
  handleRemove, 
  handleUpdate 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  if (!id) return null; // 添加空值检查

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="!mb-2"
    >
      <Card
        size="small"
        className="bg-white hover:shadow-lg transition-all duration-300 border-l-4"
        styles={{
          body: { 
            padding: '12px 16px',
            background: `${color}08`
          }
        }}
        style={{
          borderLeftColor: color
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <Text strong className="text-base truncate">
                {name}
              </Text>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ color }} />}
                  onClick={showEditModal}
                  className="hover:bg-white/50 !px-2"
                />
                <Button 
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleRemove(id, e)}
                  className="hover:bg-red-50 !px-2"
                />
              </div>
            </div>
            <Paragraph 
              type="secondary" 
              className="!mb-0 text-sm"
              ellipsis={{ rows: 2 }}
            >
              {details}
            </Paragraph>
          </div>
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>编辑任务</span>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="保存"
        cancelText="取消"
        className="!w-[400px]"
        maskClosable={false}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name, details }}
          className="mt-4"
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
            <TextArea 
              rows={4} 
              placeholder="请输入任务详情"
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default Task;
