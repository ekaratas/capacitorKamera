import { Component } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  photo: SafeResourceUrl;
  imageDataUrl;

  constructor(private sanitizer: DomSanitizer, private fireBaseStorage: AngularFireStorage, private afDB: AngularFireDatabase) {}

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    //this.imageDataUrl = image.dataUrl;
    //this.upload();
    this.uploadImage(image.dataUrl);
  }

upload() {
  const fileName = new Date().getTime() + '.jpg';
  const path = `resimler/${fileName}`;
  var storageRef = this.fireBaseStorage.storage.ref();
  var uploadTask = storageRef.child(path).putString(this.imageDataUrl, 'data_url');

  uploadTask.on('state_changed', function(snapshot){
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  }, function(error) {
    // Handle unsuccessful uploads
  }, function() {
   uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
    });
  });

  let kayit = {
  ad: fileName,
  yol: path
};
  this.afDB.list('/resimler').push(kayit);
}

encodeImageUri(imageUri, callback) {
  var c = document.createElement('canvas');
  var ctx = c.getContext("2d");
  var img = new Image();
  img.onload = function () {
    var aux:any = this;
    c.width = aux.width;
    c.height = aux.height;
    ctx.drawImage(img, 0, 0);
    var dataURL = c.toDataURL("image/jpeg");
    callback(dataURL);
  };
  img.src = imageUri;
};

uploadImage(imageURI){
  const fileName = new Date().getTime() + '.jpg';
  return new Promise<any>((resolve, reject) => {
    var storageRef = this.fireBaseStorage.storage.ref();
    let imageRef = storageRef.child('resimler').child(fileName);
    this.encodeImageUri(imageURI, function(image64){
      imageRef.putString(image64, 'data_url')
      .then(snapshot => {
        resolve(snapshot.downloadURL)
      }, err => {
        reject(err);
      })
    })
  })
}

}
