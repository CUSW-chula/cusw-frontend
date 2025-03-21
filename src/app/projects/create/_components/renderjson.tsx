import type { Template } from "@/app/types/createProjectType";
import type { TaskProps } from "@/app/types/types";
import { taskAtom } from "@/atom";
import { useAtom } from "jotai";
export const RenderJson =(template : Template)=> {
    const url = template.filePath;
    const [task, setTask] = useAtom<TaskProps[]>(taskAtom);
    fetch(url)
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        setTask(data);
        return (data);
    }
    )
    .catch(error => {
        console.error('Error fetching or posting template:', error);
    }
    );
    return null;
}