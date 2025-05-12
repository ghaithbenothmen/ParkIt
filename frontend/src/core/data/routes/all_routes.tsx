
export const all_routes = {
  // home module path
  homeOne: '/home-two',
  index: '/home',

  payment: '/payment',

  paymentSuccess:'/payment-success',
  paymentError:'/payment-error',
  activationError:'/activation-error',
  activationSuccess:'/activation-success',

  // blog module path
  blog: '/blog/*',
  blogDetails: '/blog/blog-details',
  blogGrid: '/blog/blog-grid',
  blogList: '/blog/blog-list',



  //parking math
  parkings: '/parkings/*',
  parkinglist:'/parkings',
  parkingDetails:'/parkings/parking-details/:id',
  parkingBooking:'/parkings/booking-parking/:id',

  // services module path
  services: '/services/*',

  createCar: '/services/create-car',
  createClaim: '/services/create-claim',
 
  map: '/map',
  map2: '/map2',
 
  searchList: '/services/search-list',
  
  serviceDetails1: '/services/service-details/service-details1',

  providerCars: '/providers/cars',
  providerClaims:'/providers/claims',


  commonNotification: '/customers/notification',

  // providers module path
  providers: '/providers/*',

  providerProfileSettings: '/providers/settings/provider-profile-settings',
  
 
  providerBooking: '/providers/booking',
  overdueDetailsBooking: '/providers/bookingdetails',

  providerDashboard: '/providers/dashboard',
  providerSignup: '/authentication/provider-signup',
 

  providerService: '/providers/provider-service',

  ProviderSecuritySettings: '/providers/settings/provider-security-settings',
  

  providerEnquiry: '/providers/provider-enquiry',

  // pages module path
  pages: '/pages/*',
  aboutUs: '/pages/about-us',
  error404: '/authentication/error-404',
  error500: '/authentication/error-500',

  booking1: '/pages/booking/booking-1',
  bookings: '/pages/booking',
  booking2: '/customers/user-bookings',
  invoice: '/pages/invoice',
  bookingDone: '/customers/booking-done',
  bookingPayment: '/customers/booking-payment',
  
  categories: '/pages/categories',
 

  emailOtp: '/authentication/email-otp',
  userSignup: '/authentication/user-signup',
  login: '/authentication/login',
 
 
  passwordRecovery: '/authentication/forgot-password',
  phoneOtp: '/authentication/phone-otp',
  privacyPolicy: '/pages/privacy-policy',

 
  success: '/authentication/success',
  resetPassword: '/authentication/reset-password',
  forgotPassword: '/authentication/forgot-password',

  test: '',

  // Admin Module Path

  admin: '/admin/*',


  completedBooking: '/admin/booking/completed-booking',
  pendingBooking: '/admin/pending-booking',
 

  calendarSetting: '/admin/setting/calendar-settings',
  blogCategories: '/blog-categories',
  
  cronJob: '/admin/setting/cronjob',

  adminEarnings: '/admin/reports/admin-earnings',
  allBlog: '/admin/blog/all-blog',


  authenticationSettings: '/admin/setting/authentication-settings',
  
  paymentSettings: '/admin/setting/payment-settings',
  paymentGateway: '/admin/setting/payment-gateways',
  
  inActiveServices: '/admin/services/inactive-services',
  addServices: '/admin/services/add-service',
  allServices: '/admin/services/all-services',
  editService: '/admin/services/edit-services',
  inProgressBooking: '/admin/booking/inprogress-booking',
  dashboard: '/admin/dashboard',
  
  review: '/admin/review',
  reviews: '/admin/reviews',
  reviewType: '/admin/review-type',
  roles: '/admin/roles',
  claims: '/admin/claims',
 
  security: '/admin/setting/security',
  registerreport: '/admin/reports/register-report',

  membership: '/admin/membership',

  users: '/admin/users',
  usersCustomer: '/admin/customers',
  deleteAccountReqest: '/admin/delete-account-requests',
  viewServices: '/admin/view-service',
  pendingBlog: '/admin/blog/pending-blog',
  booking: '/admin/booking',
  cancelledBooking: '/admin/bookings/cancelled-booking',
  editblog: '/admin/edit-blog',
 

  signin:'/admin/signin',


};