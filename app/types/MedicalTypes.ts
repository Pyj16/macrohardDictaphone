export interface PatientType {
    patient_id: number;
    medical_card_id: string;
    name: string;
    surname: string;
    birthday: string;
}

export interface DoctorType {
    id: number;
    name: string;
    surname: string;
    specialty: string
    email: string;
}


export interface AnamnesisType {
    id?: number;
    title: string;
    contents: string;
    diagnosis: string;
    mkb10: string;
    p_name: string;
    p_surname: string;
    d_name:string;
    d_surname: string;
    id_patient: number;
    id_anamnesis: number;
    date: string;
    status: string;
    "country": string,
    "zipcode":string,
    'city': string,
    "address":string,
    "specialty":string,
    "kzz": string,
    "birthday": string,
}

export interface updatedAnamnesisType {
    content: string;
    anamnesis_id: number;
    diagnosis: string;
    mkb10: string;
    patient_id: number;
}