import {AnamnesisType, DoctorType, PatientType} from "@/app/types/MedicalTypes";

export const doctors: DoctorType[] = [{
    id: 1,
    name: "Emma",
    surname: "Peterson",
    specialty: "Internal Medicine",
    email: "emma.peterson@hospital.org",
}];

export const patients: PatientType[] = [
    {
    id: 1,
    medicalId: "M123456789",
    name: "John",
    surname: "Smith",
    birthday: "1985-04-12",
    },

    {
    id: 2,
    medicalId: "M987654321",
    name: "Anna",
    surname: "Novak",
    birthday: "1990-11-25",
    }
];

export const anamnesis: AnamnesisType[] = [
    {
        id: 1,
        title: "Routine Checkup",
        content: `Patient reports experiencing mild headaches two to three times per week, typically in the late afternoon or evening. Symptoms are described as a dull ache localized to the temples, sometimes accompanied by light sensitivity but without nausea or visual disturbances. Blood pressure was measured at 122/78 mmHg, and no abnormalities were noted in heart rate or rhythm. No signs of infection, neurological deficit, or other physical complaints were reported. Patient admits to drinking 3–4 cups of coffee daily and spending significant time in front of screens. Advised to monitor caffeine intake, take regular breaks from screens, and engage in daily walks. Follow-up scheduled for next week.`,
        patient: patients[0],
        doctor: doctors[0],
        date: "2025-06-10",
    },
    {
        id: 2,
        title: "Follow-up Visit",
        content: `Patient returned for follow-up on previously reported headaches. Since reducing caffeine intake to one cup per day and implementing screen breaks, symptoms have notably improved. Patient now reports experiencing headaches only once per week, with lower intensity. Blood pressure remains stable at 118/76 mmHg. Sleep quality has improved due to reduced late-night screen use. No new complaints or symptoms have emerged. Patient appears well-rested and mentally alert. Encouraged to continue new habits and maintain a healthy sleep schedule. No medications were prescribed at this time. Advised to return in one month or sooner if symptoms return.`,
        patient: patients[0],
        doctor: doctors[0],

        date: "2025-06-17",
    },
    {
        id: 3,
        title: "Initial Consultation",
        content: `Patient presented with complaints of lower back pain, primarily in the lumbar region, lasting for the past two weeks. Pain is described as a constant dull ache that intensifies during prolonged sitting and occasionally radiates toward the left hip. No history of trauma or known underlying conditions. Physical examination revealed mild tenderness in the lower spine and restricted flexibility during forward bending. Neurological assessment was normal, with no signs of sciatica or motor deficit. Patient works a desk job and lacks regular physical activity. Prescribed a stretching and core-strengthening routine along with scheduled physiotherapy. Recommended ergonomic adjustments at work and daily posture correction exercises.`,
        patient: patients[1],
        doctor: doctors[0],

        date: "2025-06-11",
    },
    {
        id: 4,
        title: "Back Pain Follow-up",
        content: `Patient reports significant improvement in lower back pain after two weeks of physiotherapy and adherence to the prescribed stretching regimen. Pain intensity has reduced from 7/10 to 2/10 on most days. Patient is now able to sit for longer periods without discomfort and has returned to moderate physical activity, including walking and swimming. Reports better posture awareness and improved sleep quality. Examination shows improved range of motion and reduced tenderness. Continued with physiotherapy once per week and advised to integrate regular core exercises into daily routine. No medications needed. Patient expressed satisfaction with progress and motivation to maintain physical health.`,
        patient: patients[1],
        doctor: doctors[0],
        date: "2025-06-18",
    },
];

