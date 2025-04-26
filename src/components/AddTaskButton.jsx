import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AddTaskButton = ({ handleClick }) => {
  return (
    <Button 
      type="text"
      icon={<PlusOutlined />}
      onClick={handleClick}
    />
  );
};

export default AddTaskButton;
