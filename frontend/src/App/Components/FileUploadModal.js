import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import {setOpenModal} from "../../LocalStore/allSlice";
// import axios, { Axios } from 'axios';
import { borderRadius, width } from '@mui/system';
import {setFilesName,setSnackBarSuccess} from '../../LocalStore/allSlice';
import { useEffect } from 'react';

export default function ScrollDialog({agentName}) {
  const [open, setOpen] = React.useState(true);
  const [scroll, setScroll] = React.useState('paper');

  const dispatch = useDispatch();

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(setOpenModal(false))
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);


  const [files, setFiles] = useState();
    // const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const [previews, setPreviews] = useState([]);

    const handleMultipleChange = (event) => {
        console.log(event.target.files);
        setFiles([...event.target.files]);
        console.log(files);
        // const file = new FileReader();
      
        // file.onload = function() {
        //   setPreview(file.result);
        // }
      
        // file.readAsDataURL(event.target.files)
        // console.log(file);

            const selectedFiles = event.target.files;

            // Loop through each selected file
            const filePreviews = [];
            for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const reader = new FileReader();

            // Closure to capture the file and set the preview
            reader.onload = (function (file) {
                return function (e) {
                filePreviews.push(e.target.result);
                
                // If all files have been processed, update state
                if (filePreviews.length === selectedFiles.length) {
                    setPreviews(filePreviews);
                    // dispatch(setFilesName({agentName,filePreviews}));
                    // dispatch(setFilesName(filePreviews));
                    // dispatch(setFilesName(files));
                    // setFiles(Array.from(event.target.files));
                }
              };
            })(file);
            
            // Read the file as data URL
            reader.readAsDataURL(file);
            }

    };

    useEffect(() =>
    {
      console.log(files);
      // console.log(files?.name)
      // const tempfile = files.filter(())
      // dispatch(setFilesName(files));
    },[files])

    const handleMultipleSubmit = async (event) => {
            event.preventDefault();
            if ( typeof files === 'undefined' ) 
                return;
            const url = 'http://localhost:5000/uploadFiles';
            console.log(files,files.length, files[0])
            const formData = new FormData();
            for (let index = 0; index < files.length; index++) {
                console.log("came");
                // formData.append(`file${index}`, files[index]);
                formData.append(`file${index}`,files[index]);
                // console.log(files[index][name])
                // formData.append(`fileName${index}`, files[index][name]);
            };

            console.log(formData);
            console.log("HI",[...formData.entries()]);


            fetch('http://localhost:5000/uploadFiles', {
            method: 'POST',
            body: formData,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // dispatch(setFilesName({agentName,files}));
                dispatch(setFilesName({agentName,previews, files}));
                dispatch(setSnackBarSuccess(true));
                handleClose();  // Closing of Popup on successfull uploading
            })
            .catch(error => {
                console.error(error);
            });
    }

  return (
    <React.Fragment>
      {/* <Button onClick={handleClickOpen('paper')}>scroll=paper</Button>
      <Button onClick={handleClickOpen('body')}>scroll=body</Button> */}
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">File Upload</DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {/* <form onSubmit={handleMultipleSubmit} style={{ alignItems: 'center', marginBottom: '10px', display: 'grid', padding: '6px 5px', margin: '3rem 3rem', alignContent:'space-around'}}> */}
            {/* <h1>File Upload Here</h1> */}
            <Typography id="modal-modal-title" variant="h4" component="h2">Upload File Here</Typography>
            <input type="file" multiple  onChange={handleMultipleChange} name='file' style={{fontSize: '2rem', marginTop: '2rem', marginBottom: '3rem'}} />
            {/* <p>After choosen the file click on Upload</p> */}
            {/* <Typography id="modal-modal-title" variant="h4" component="h2">After choosing the file click on Upload</Typography> */}

        {/* {preview && (
          <p><img src={preview} alt="Upload preview"   style={{ maxWidth: '100%' }}   /></p>
        )} */}

        {previews.map((preview, index) => (
          <div key={index} style={{ display: 'grid', alignItems: 'center', marginBottom: '10px' }} >
                    {/* <p style={{ marginRight: '10px', mt:3 }}>{files[index].name}</p> */}
                    <Typography id="modal-modal-title" variant="h4" component="h4">{files[index].name}</Typography>
                    <img src={preview} alt={`Preview of ${files[index].name}`} style={{ maxWidth: '100%', maxHeight:'80%'}} />
                </div>
            ))}
            {/* <button type="submit" style={{width: '16rem', height: '5rem', fontSize: '3rem'}} >Upload</button> */}
        {/* </form> */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleMultipleSubmit}>UPLOAD</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


// https://mui.com/material-ui/react-dialog/