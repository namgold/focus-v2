import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import React from 'react'
import { createRoot } from 'react-dom/client'

import Options from './Options'
import './index.css'

// import 'bootstrap'

const container = document.getElementById('app-container')
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(<Options title={'Settings'} />)
