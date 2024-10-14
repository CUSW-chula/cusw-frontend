import Uploadfile from './uploadfile';
import Emoji from './emoji';
const workspace = () => {
  return (
    <div className="">
      workspace
      <div className="flex justify-between">
        <Emoji />
        <Uploadfile />
      </div>
    </div>
  );
};

export default workspace;
