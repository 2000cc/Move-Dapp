import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Col, Input, Button } from "antd";
import { useState } from "react";
import { ABI } from "../abi";
import { useAlert } from "../hooks/alertProvider";
import { provider } from "../utils/consts";
import { Task } from "../utils/types";
import ImageUploader from "./ImageUploader"

type TaskInputProps = {
  setTransactionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

export default function TaskInput({
  setTransactionInProgress,
  tasks,
  setTasks,
}: TaskInputProps) {
  const [newnftname, setnewnftname] = useState("");
  const [newnftlink, setnewnftlink] = useState("");
  const [newnftdescription, setnewnftdescription] = useState("");

  const { account, network, signAndSubmitTransaction } = useWallet();
  const { setSuccessAlertHash } = useAlert();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => setter(event.target.value);

  const onWriteName = handleInputChange(setnewnftname);
  const onWriteLink = handleInputChange(setnewnftlink);
  const onWriteDescription = handleInputChange(setnewnftdescription);

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    // hold the latest task.task_id from our local state

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,//应该删除

      name: newnftname,
      link: newnftlink,
      description: newnftdescription,

    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction({
        type: "entry_function_payload",
        function: `${ABI.address}::oneclicknft::mint`,
        type_arguments: [],

        //这里要和move合约中的参数相对应
        arguments: [newnftname+" ", newnftdescription, newnftlink],
      });
      // wait for transaction
      await provider.waitForTransaction(response.hash);
      setSuccessAlertHash(response.hash, network?.name);
      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setnewnftname("");
      setnewnftlink("");
      setnewnftdescription("");

    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (

    //TODO
    //把图片转化为base64文本
    <Col span={8} offset={8} >
      {/* <ImageUploader/> */}

      <Input.Group compact>
        <Input
          onChange={(event) => onWriteLink(event)}
          placeholder="Set NFT's image"
          size="large"
          value={newnftlink}
        />

      </Input.Group>
      <p> </p>

      <Input.Group compact>
        <Input
          onChange={(event) => onWriteName(event)}
          placeholder="Set NFT's name"
          size="large"
          value={newnftname}
        />

      </Input.Group>
      <p> </p>
      <Input.Group compact>
        <Input
          onChange={(event) => onWriteDescription(event)}
          placeholder="Set NFT's description"
          size="large"
          value={newnftdescription}
        />
        {/* <Button
          onClick={onTaskAdded}
          type="primary"
          style={{ height: "40px", backgroundColor: "#3f67ff" }}
        >
          Add
        </Button> */}
      </Input.Group>
      <div style={{display: 'flex', margin: '10px auto',justifyContent: 'center'}}>
        <Button
            onClick={onTaskAdded}
            type="primary"
            style={{ height: "40px", backgroundColor: "#3f67ff" }}
          >
            Add
          </Button>
      </div>
          

    </Col>
  );
}
