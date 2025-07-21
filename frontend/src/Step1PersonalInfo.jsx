import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step1PersonalInfo({ formData, handleChange }) {
  return (
    <>
      <h5 className="mb-3 text-success">1. Personal Info Section</h5>
      <TextField fullWidth margin="normal" label="Full Name" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
      <TextField fullWidth margin="normal" label="Age" type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
      <FormControl fullWidth margin="normal">
        <InputLabel>Gender</InputLabel>
        <Select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth margin="normal" label="Height (cm)" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} />
      <TextField fullWidth margin="normal" label="Weight (kg)" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} />
    </>
  );
}
