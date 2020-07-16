//El timestamp es necesario para la recepcion pero no para enviar post
export interface Post {
  id: string;
  title: string;
  content: string;
  timestamp?: number;
  creator: string;
  userdId?:string;
}
