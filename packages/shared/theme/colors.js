import Color from "color";
import AppColors from "@assets/theme/colors";

const colors = {
  scheduleItemBackground: AppColors.app.dark,
  spacer: "#4e4d52",
  calendarSelectedDayColor: AppColors.brand.alpha,
  calendarBackground: AppColors.app.dark,
  dialogButtonBackground: AppColors.brand.alpha
};

export const Primary = AppColors.brand.alpha;
export const Primary50Percent = Color(Primary)
  .alpha(0.5)
  .toString();

export const Secondary = AppColors.brand.beta;
export const SecondaryLight = Color(Secondary)
  .alpha(0.2)
  .toString();

export const Tertiary = Color.red;
export const Highlight = Color.orange;

export const White10Percent = Color(Color.white)
  .alpha(0.1)
  .toString();
export const White20Percent = Color(Color.white)
  .alpha(0.2)
  .toString();
export const White50Percent = Color(Color.white)
  .alpha(0.5)
  .toString();

export const Grey50Percent = Color(Color.grey)
  .alpha(0.5)
  .toString();

export const DarkGrey50Percent = Color(Color.darkgrey)
  .alpha(0.5)
  .toString();
export const DarkGrey80Percent = Color(Color.darkgrey)
  .alpha(0.8)
  .toString();

export const Background = Color.darkgrey;

export const Error = Color.red;
export const Success = Color.blue;

export const BaseBorderColor = Color(Color.darkgrey)
  .alpha(0.2)
  .toString();
export const BaseBackgroundColor = Color(Color.darkgrey)
  .alpha(0.3)
  .toString();

export default colors;
