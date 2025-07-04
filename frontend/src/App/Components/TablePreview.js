import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import BasicTable from './Tables';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function FullScreenDialog({
  agentName,
  setShowTable,
  showTable,
}) {
  const [open, setOpen] = React.useState(showTable);

  const handleClose = () => {
    setOpen(false);
    setShowTable(false); // Ensure parent gets notified
  };

  React.useEffect(() => {
    setOpen(showTable); // Sync with parent state
  }, [showTable]);

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Knowledge Base of {agentName}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save and close
            </Button>
          </Toolbar>
        </AppBar>
        <BasicTable agentName={agentName} />
      </Dialog>
    </React.Fragment>
  );
}