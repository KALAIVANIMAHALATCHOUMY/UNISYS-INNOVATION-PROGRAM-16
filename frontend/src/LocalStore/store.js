import { configureStore } from '@reduxjs/toolkit'
import counterReducer  from './allSlice'
export default configureStore({
  reducer: {
    counter: counterReducer,
  },
})