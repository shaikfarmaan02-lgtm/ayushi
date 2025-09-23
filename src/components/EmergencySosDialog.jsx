import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const EmergencySosDialog = ({ open, onClose, onAdd, contact, setContact }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Emergency Contact</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Contact Name"
          type="text"
          fullWidth
          variant="outlined"
          value={contact.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="phone"
          label="Phone Number"
          type="tel"
          fullWidth
          variant="outlined"
          value={contact.phone}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">Contact Method</FormLabel>
          <RadioGroup
            row
            name="type"
            value={contact.type}
            onChange={handleChange}
          >
            <FormControlLabel value="call" control={<Radio />} label="Call" />
            <FormControlLabel value="sms" control={<Radio />} label="SMS" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onAdd} 
          variant="contained" 
          color="primary"
          disabled={!contact.name || !contact.phone}
        >
          Add Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencySosDialog;