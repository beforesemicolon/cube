import {Cube} from "../types";
import initLocale from "./intl-locale";
import initMsg from "./intl-msg";
import initDate from "./intl-datetime";
import initDuration from "./intl-duration";
import initList from "./intl-list";
import initName from "./intl-name";
import initNumber from "./intl-number";
import initPlural from "./intl-plural";
import initRelTime from "./intl-rel-time";

export default (cube: Cube) => {
	initLocale(cube)
	initMsg(cube)
	initNumber(cube)
	initName(cube)
	initList(cube)
	initDate(cube)
	initDuration(cube)
	initPlural(cube)
	initRelTime(cube)
}
export * from "./utils/time-in-miliseconds"
