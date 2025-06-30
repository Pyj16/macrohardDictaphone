export interface PatientType {
    id: number;
    medicalId: string;
    name: string;
    surname: string;
    birthday: string;
}

export interface SessionPatientType {
    id: number;
    name: string;
    surname: string;
}

export interface DoctorType {
    id: number;
    name: string;
    surname: string;
    specialty: string
    email: string;
}



export interface AnamnesisType {
    id: number;
    title: string;
    content: string;
    patient: PatientType;
    doctor: DoctorType;
    date: string;
}

