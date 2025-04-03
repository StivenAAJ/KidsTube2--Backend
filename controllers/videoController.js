const Video = require('../models/videoModel'); 

const videoCreate = (req, res) => {
    let video = new Video({
        title: req.body.title,
        videoUrl: req.body.videoUrl,
        description: req.body.description,
    });
    
    if(video.title && video.videoUrl) {
        video.save()
        .then(() => {
            res.status(201);
            res.header({ 'location': `/videos/?id=${video.id}` });
            res.json(video); //creates the video and returns the video in the body
        })
        .catch(err => {
            console.log( "Error al guardar el video", err);
            res.status(422).json({ error: 'Error al guardar el video', details: err });
        });

    } else{
        res.status(422);
        console.log("Error mientras se guardaba el video");
        res.json({ 
            error: 'el titulo y la Url son requeridos' 
        });
    }
};

const videoGet = (req, res) => {
    if (req.query && req.query.id) {
        Video.findById(req.query.id)
            .then(video => {
                if (video) {
                    res.json(video);
                } else {
                    res.status(404).json({ error: "El video no existe" });
                }
            })
            .catch(err => {
                console.error("Error al traer el video", err);
                res.status(422).json({ error: 'Error', details: err });
            });
    } else {
        // Get all videos if no id is provided
        Video.find()
            .then(videos => {
                res.json(videos);
            })
            .catch(err => {
                console.error("Error al traer los videos", err);
                res.status(422).json({ error: 'Error', details: err });
            });
    }
};

const videoDelete = (req, res) => {
    const { id } = req.params; 

    if(id) {
        Video.findByIdAndDelete(id)
        .then(video => {
            if(video) {
                res.status(204).json({}); 
            } else {
                res.status(404).json({ error: "El video no existe" }); // No se encontró el video
            }
        })
        .catch(err => {
            console.log("error mientras se borraba el video", err);
            res.status(422).json({ error: 'Hubo un error al borrar el video', details: err });
        });
    } else {
        res.status(400).json({ error: 'El ID del video es requerido' }); // id no encontrado
    }
};


const videoPatch = (req, res) => {
    const { id } = req.params; 

    if(id) {
        Video.findById(id) 
        .then(video => {
            if(!video) {
                res.status(404).json({ error: "El video no existe" }); // Si el video no existe
                return;
            }

            video.title = req.body.title || video.title;
            video.videoUrl = req.body.videoUrl || video.videoUrl;
            video.description = req.body.description || video.description;

            video.save()
            .then(() => {
                res.status(200).json(video); // status 200 (OK) y retorna el video
            })
            .catch(err => {
                console.log("error mientras se actualizaba el video", err);
                res.status(422).json({ error: 'Hubo un error mientras se actualizaba el video', details: err });
            });
        })
        .catch(err => {
            console.log("error mientras se actualizaba el video", err);
            res.status(404).json({ error: 'Hubo un error mientras se actualizaba el video', details: err });
        });
    } else {
        res.status(400).json({ error: 'El ID del video es requerido' }); // Error si no se pasa un ID
    }
};


module.exports =
{
    videoCreate,
    videoGet,
    videoDelete,
    videoPatch 
};
