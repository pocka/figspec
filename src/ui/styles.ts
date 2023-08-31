import { styles as empty } from "./empty/empty";
import { styles as fullscreenPanel } from "./fullscreenPanel/fullscreenPanel";
import { styles as iconButton } from "./iconButton/iconButton";
import { styles as infoItems } from "./infoItems/infoItems";
import { styles as inspectorPanel } from "./inspectorPanel/inspectorPanel";
import { styles as menuBar } from "./menuBar/menuBar";
import { styles as preferencesPanel } from "./preferencesPanel/preferencesPanel";
import { styles as selectBox } from "./selectBox/selectBox";

export const styles: string =
  inspectorPanel +
  selectBox +
  iconButton +
  fullscreenPanel +
  menuBar +
  infoItems +
  empty +
  preferencesPanel;
