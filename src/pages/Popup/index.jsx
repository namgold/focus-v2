import React from 'react'
import { createRoot } from 'react-dom/client'

import Popup from './Popup'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
// import 'bootstrap'

import './index.css'

const container = document.getElementById('app-container')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(<Popup />)
