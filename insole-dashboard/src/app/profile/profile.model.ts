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
}
