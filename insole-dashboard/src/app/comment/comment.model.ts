//El timestamp es necesario para la recepcion pero no para enviar comment
export interface Comment {
  id: string;
  title: string;
  content: string;
  timestamp?: number;
  creator: string;
  userdId?:string;
}
