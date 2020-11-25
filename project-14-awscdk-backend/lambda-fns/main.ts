import createLolly from './createLolly';
import getLollyBySlug from './getLollyBySlug';
import listLolly from './listLolly';



type Lolly  = {
    recipientName: string
    senderName: string
    message: string
    topColor: string
    mediumColor: string
    bottomColor: string
    path: string
  }


type AppSyncEvent = {
   info: {
     fieldName: string
  },
   arguments: {
    path: string,
    lolly: Lolly
  }
}

exports.handler = async (event:AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "getLollyBySlug":
            return await getLollyBySlug(event.arguments.path);
        case "createLolly":
            return await createLolly(event.arguments.lolly);
        case "getAllLollies":
            return await listLolly();
        default:
            return null;
    }
}