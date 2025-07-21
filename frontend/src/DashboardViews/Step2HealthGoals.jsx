import { FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';

export default function Step2HealthGoals({ formData, handleChange, toggleCheckbox }) {
  return (
    <>
      <h5 className="mb-3 text-success">2. Health & Body Goals</h5>
      <FormControl fullWidth margin="normal">
        <InputLabel>Goal</InputLabel>
        <Select value={formData.goal} onChange={(e) => handleChange('goal', e.target.value)}>
          <MenuItem value="Lose weight">Lose weight</MenuItem>
          <MenuItem value="Maintain weight">Maintain weight</MenuItem>
          <MenuItem value="Gain weight">Gain weight</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Activity Level</InputLabel>
        <Select value={formData.activityLevel} onChange={(e) => handleChange('activityLevel', e.target.value)}>
          <MenuItem value="Sedentary">Sedentary</MenuItem>
          <MenuItem value="Lightly active">Lightly active</MenuItem>
          <MenuItem value="Moderately active">Moderately active</MenuItem>
          <MenuItem value="Very active">Very active</MenuItem>
        </Select>
      </FormControl>
      <FormGroup>
        <Typography variant="subtitle1">Medical Conditions:</Typography>
        {['Diabetes', 'Hypertension', 'High Cholesterol'].map(cond => (
          <FormControlLabel
            key={cond}
            control={<Checkbox checked={formData.medicalConditions.includes(cond)} onChange={() => toggleCheckbox('medicalConditions', cond)} />}
            label={cond}
          />
        ))}
      </FormGroup>
    </>
  );
}
