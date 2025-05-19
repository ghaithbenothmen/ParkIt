import { dashboard } from '../json/dashboard_data';
import { header } from '../json/header';
// import { customerWalletData } from '../json/customerWalletData';

const initialState = {
  header_data: header,
  dashboard_data: dashboard,
  toggleSidebar: false,
  toggleSidebar2: false,
  showLoader: true,
  darkMode: false,
  mouseOverSidebar: false,
  // providersSidebar:providersSidebar,
  current_route: { base: '', page: '', last: '' },
  current_route_array: [],
  mobileSidebar: false,
};

export default initialState;
