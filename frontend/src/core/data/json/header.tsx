import { all_routes } from '../routes/all_routes';

const routes = all_routes;

export const header = [
  {
    id:1,
    tittle: 'Home',
    showAsTab: false,
    routes: routes.index,
    separateRoute: false,
  },
  {
    id:2,
    tittle: 'Parkings',
    showAsTab: false,
    routes: '/#parkings',
    separateRoute: false,
  },
  {
    id:3,
     tittle: 'How It Works',
    showAsTab: false,
    routes: '/#works',
    separateRoute: false,
  },
  {
    id:4,
   tittle: 'Reviews',
    showAsTab: false,
    routes: '/#reviews',
    separateRoute: false,
  },
  {
    id:5,
    tittle: 'About Us',
    showAsTab: false,
    routes: '/#about',
    separateRoute: false,
  },
  
];