import {
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { useState, memo } from "react";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const priorityColors = {
  high: "#f5222d",
  medium: "#faad14",
  low: "#52c41a",
};

const priorityLabels = {
  high: "高",
  medium: "中",
  low: "低",
};

const Task = memo(
  ({
    name,
    details,
    id,
    color,
    provided,
    snapshot,
    handleRemove,
    handleUpdate,
    priority = "medium",
    dueDate = null,
  }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();

    const showEditModal = () => {
      form.setFieldsValue({
        name,
        details,
        priority: priority || "medium",
        dueDate: dueDate ? dayjs(dueDate) : null,
      });
      setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
      form.validateFields().then((values) => {
        handleUpdate(
          id,
          values.name,
          values.details,
          values.priority,
          values.dueDate ? values.dueDate.valueOf() : null
        );
        setIsEditModalOpen(false);
        form.resetFields();
      });
    };

    const isOverdue = dueDate && new Date(dueDate).getTime() < Date.now();

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
              padding: "12px 16px",
              background: `${color}08`,
            },
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

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {priority && (
                  <Tag color={priorityColors[priority]}>
                    <FlagOutlined /> {priorityLabels[priority]}优先级
                  </Tag>
                )}

                {dueDate && (
                  <Tag color={isOverdue ? "red" : "blue"}>
                    <ClockCircleOutlined />{" "}
                    {dayjs(dueDate).format("MM-DD HH:mm")}
                  </Tag>
                )}
              </div>
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
            initialValues={{
              name,
              details,
              priority: priority || "medium",
              dueDate: dueDate ? dayjs(dueDate) : null,
            }}
            className="mt-4"
          >
            <Form.Item
              name="name"
              label="任务名称"
              rules={[{ required: true, message: "请输入任务名称！" }]}
            >
              <Input placeholder="请输入任务名称" />
            </Form.Item>
            <Form.Item
              name="details"
              label="任务详情"
              rules={[{ required: true, message: "请输入任务详情！" }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入任务详情"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Space style={{ display: "flex", width: "100%" }}>
              <Form.Item
                name="priority"
                label="优先级"
                style={{ width: "50%" }}
              >
                <Select placeholder="请选择优先级">
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
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
      </div>
    );
  }
);

export default Task;
