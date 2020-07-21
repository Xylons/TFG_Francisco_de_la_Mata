export interface Profile {
  userId: string;
  name: string;
  surname: string;
  phone: string;
  userImagePath: string;
  //Campos opcionales segun tipo
  typeOfResponsible?:string;
  bornDate?: number | Date;
  patologies?:string[];
  insoles?: string[];
  contactPhone?:string;
  type?:string;
  rol?:string;
  responsibles?:string[];
  description?: string;
  personalId?: string;
  height?: number;
  weight?: number;
  gender?: string;
  tinetti?: number;
  getuptest?:number;
  mms?: number;
  timestamp?: Date;
  leftInsole?: number;
  rightInsole?: number;
  //selectedGender?:string
}
