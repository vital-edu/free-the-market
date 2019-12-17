import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { LinearProgress } from '@material-ui/core';

interface LoadingDialogProps {
  title?: string;
  message?: string;
  loadingProgress?: number;
}

export default function LoadingDialog(props: LoadingDialogProps) {
  return (
    <Dialog
      fullWidth={true}
      open={true}
      aria-labelledby="responsive-dialog-title"
    >
      {props.title && <DialogTitle>
        {props.title}
      </DialogTitle>}
      <DialogContent>
        <LinearProgress variant="determinate" value={props.loadingProgress} />
        <DialogContentText>{props.message}</DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
