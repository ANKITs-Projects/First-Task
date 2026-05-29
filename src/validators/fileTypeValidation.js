const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']


function validateFileType (fileTypes) {
    return fileTypes.every(ele => allowedTypes.includes(ele))
}


module.exports = {validateFileType}