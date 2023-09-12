import { styles as empty } from "./empty/empty.js";
import { styles as fullscreenPanel } from "./fullscreenPanel/fullscreenPanel.js";
import { styles as iconButton } from "./iconButton/iconButton.js";
import { styles as infoItems } from "./infoItems/infoItems.js";
import { styles as inspectorPanel } from "./inspectorPanel/inspectorPanel.js";
import { styles as menuBar } from "./menuBar/menuBar.js";
import { styles as preferencesPanel } from "./preferencesPanel/preferencesPanel.js";
import { styles as selectBox } from "./selectBox/selectBox.js";
import { styles as snackbar } from "./snackbar/snackbar.js";

export const styles: string =
  inspectorPanel +
  selectBox +
  iconButton +
  fullscreenPanel +
  menuBar +
  infoItems +
  empty +
  preferencesPanel +
  snackbar;
