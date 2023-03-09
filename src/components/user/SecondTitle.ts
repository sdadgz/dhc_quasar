
// 禁用的轮播图和视频
import {Head} from "../main/head-item";

export function banCarouselAndVideo(label: string, firstTitleList: Head[], todo: () => boolean, undo?: () => void){
    const fun = () => {
        console.log("a");
    }
    fun && fun();
    // 写死了第一个是轮播图，最后一个是视频
    firstTitleList[0].label == label ||
    firstTitleList[firstTitleList.length - 1].label == label ?
        undo && undo() : todo && todo();
}