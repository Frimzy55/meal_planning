import { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import axios from 'axios';

import Step1PersonalInfo from './Step1PersonalInfo';
import Step2HealthGoals from './Step2HealthGoals';
import Step3DietPreferences from './Step3DietPreferences';
import Step4MealSchedule from './Step4MealSchedule';

const TOTAL_STEPS = 4;

export default function ProfilePreferences() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', age: '', gender: '', height: '', weight: '',
    goal: '', activityLevel: '', medicalConditions: [],
    dietType: '', allergies: '', religiousRestrictions: '', dislikedFoods: '',
    mealsPerDay: '', mealTimes: { breakfast: '', lunch: '', dinner: '' }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleCheckbox = (field, value) => {
    const list = formData[field];
    const updated = list.includes(value)
      ? list.filter(v => v !== value)
      : [...list, value];
    handleChange(field, updated);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/profile', formData);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1PersonalInfo formData={formData} handleChange={handleChange} />;
      case 2:
        return <Step2HealthGoals formData={formData} handleChange={handleChange} toggleCheckbox={toggleCheckbox} />;
      case 3:
        return <Step3DietPreferences formData={formData} handleChange={handleChange} />;
      case 4:
        return <Step4MealSchedule formData={formData} handleChange={handleChange} handleNestedChange={handleNestedChange} />;
      default:
        return null;
    }
  };

  return (
    <Box className="flex-grow-1 p-4 overflow-auto">
      <Box className="bg-white rounded shadow-sm p-4">
        {/* Step Label and Progress Bar */}
        <Box className="mb-4">
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success' }}>
            Step {step} of {TOTAL_STEPS}
          </Typography>
          <LinearProgress
  variant="determinate"
  value={(step / TOTAL_STEPS) * 100}
  sx={{
    height: 10,
    borderRadius: 5,
    mt: 1,
    '& .MuiLinearProgress-bar': {
      backgroundColor: 'green' // This sets the progress bar to green
    },
    backgroundColor: '#c8e6c9' // Optional: light green background for the unfilled track
  }}
/>

        </Box>

        {renderStep()}

        {/* Navigation Buttons */}
        <Box className="mt-4 d-flex justify-content-between">
          <Button
            variant="outlined"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button variant="contained" color="success" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
