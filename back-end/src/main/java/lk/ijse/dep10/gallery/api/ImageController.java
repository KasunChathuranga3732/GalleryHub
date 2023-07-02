package lk.ijse.dep10.gallery.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/images")
public class ImageController {

    @Autowired
    private ServletContext servletContext;

    @GetMapping
    public List<String> getAllImages(UriComponentsBuilder uriBuilder) {
        ArrayList<String> imageFileList = new ArrayList<>();
        String imgDirPath = servletContext.getRealPath("/images");
        File imgDir = new File(imgDirPath);
        String[] imageFileNames = imgDir.list();
        for (String imageFileName : imageFileNames) {
            UriComponentsBuilder cloneBuilder = uriBuilder.cloneBuilder();
            String url = cloneBuilder.pathSegment("images", imageFileName).toUriString();
            imageFileList.add(url);
        }
        return imageFileList;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<String> saveImages(@RequestPart("images") List<Part> imageFiles, UriComponentsBuilder urlBuilder){
        List<String> imageUrlList = new ArrayList<>();
        if(imageFiles != null){
            String imageDirPath = servletContext.getRealPath("/images");
            for (Part imageFile : imageFiles) {
                String imageFilePath = new File(imageDirPath, imageFile.getSubmittedFileName())
                        .getAbsolutePath();
                try{
                    imageFile.write(imageFilePath);
                    UriComponentsBuilder cloneBuilder = urlBuilder.cloneBuilder();
                    String imageUrl = cloneBuilder.pathSegment("images",
                            imageFile.getSubmittedFileName()).toUriString();
                    imageUrlList.add(imageUrl);

                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return imageUrlList;
    }


    @GetMapping("/downloadImage/{name}")
    public void downloadImage(@PathVariable("name") String name, HttpServletResponse response) throws IOException {
        // Get the image file
        String imgDirPath = servletContext.getRealPath("/images");
        File imageFile = new File(imgDirPath , name);

        // Set the headers
        response.setContentType("image/jpeg");

        // Send the image data
        try (InputStream is = new FileInputStream(imageFile);
             OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                System.out.println("Working");
                os.write(buffer, 0, bytesRead);
            }
        }
    }

}
