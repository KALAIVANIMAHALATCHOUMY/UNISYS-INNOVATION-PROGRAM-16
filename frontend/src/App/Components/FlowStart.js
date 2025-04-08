import '../App.css';
import Flow from '../chatgpt.js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import GrainIcon from '@mui/icons-material/Grain';
import Typography from '@mui/material/Typography';

export default function FlowStart() {
    return (
    <div className="App">
        <header className="App-header">Gen AI Agent Builder for Enterprise Application</header>
        <Breadcrumbs aria-label="breadcrumb" sx={{ paddingLeft: '15px' }}>
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center' }}
                  color="inherit"
                  href="/"
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Home
                </Link>
                <Typography
                  sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}
                >
                  <GrainIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Agent Builder
                </Typography>
              </Breadcrumbs>
        <Flow />
        </div>
    )
}