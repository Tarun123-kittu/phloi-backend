let SettingModel = require('../../models/settingsModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')




const createSlug = (title) => {
  return title
    .toLowerCase() 
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
};

exports.add_section = async (req, res) => {
  try {
    const { section, pages } = req.body;

    if (!section) {
      return res.status(400).json(errorResponse('Section name is required'));
    }

 
    const updatedPages = pages.map((page) => ({
      ...page,
      slug: createSlug(page.title),
    }));

    const newSection = new SettingModel({ section, pages: updatedPages });
    await newSection.save();

    return res.status(201).json(successResponse('Section added successfully', newSection));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
};






exports.get_sections = async (req, res) => {
  try {
    const sections = await SettingModel.find();
    return res.status(200).json(successResponse('Sections fetched successfully', sections));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse('Something went wrong', error.message));
  }
};



exports.get_section_by_id = async (req, res) => {
  try {
    const id = req.query.sectionId;

    if (!id) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide section Id in the query params')) }

    const section = await SettingModel.findById(id);
    if (!section) {
      return res.status(404).json(errorResponse('Section not found'));
    }

    return res.status(200).json(successResponse('Section fetched successfully', section));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse('Something went wrong', error.message));
  }
};





exports.update_section = async (req, res) => {
  try {
    const { sectionId: id, section, pages } = req.body;

    if (!id) {
      return res.status(400).json(
        errorResponse('Please provide the section ID which you want to update')
      );
    }

    let updatedData = { section };
    if (pages) {
      updatedData.pages = pages.map((page) => ({
        ...page,
        slug: createSlug(page.title),
      }));
    }

    const updatedSection = await SettingModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedSection) {
      return res.status(404).json(errorResponse('Section not found'));
    }

    return res.status(200).json(successResponse('Section updated successfully', updatedSection));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(
      errorResponse('Something went wrong', error.message)
    );
  }
};




exports.delete_section = async (req, res) => {
  try {
    const id = req.query.sectionId;

    if (!id) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide section Id "))
    }

    const deletedSection = await SettingModel.findByIdAndDelete(id);
    if (!deletedSection) {
      return res.status(404).json(errorResponse('Section not found'));
    }

    return res.status(200).json(successResponse('Section deleted successfully'));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse('Something went wrong', error.message));
  }
};





exports.add_page_to_section = async (req, res) => {
  try {
    const id = req.body.sectionId;
    const { title, content } = req.body;

    if (!id) {
      return res.status(400).json(
        errorResponse(messages.generalError.somethingWentWrong, "Please provide section Id in the body")
      );
    }
    if (!title || !content) {
      return res.status(400).json(errorResponse('All fields are required for the page'));
    }

    const section = await SettingModel.findById(id);
    if (!section) {
      return res.status(404).json(errorResponse('Section not found'));
    }

    
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') 
      .replace(/^-+|-+$/g, '');   

    section.pages.push({ title, content, slug });
    await section.save();

    return res.status(201).json(successResponse('Page added to section', section));
  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(
      errorResponse(messages.generalError.somethingWentWrong, error.message)
    );
  }
};





exports.delete_page = async (req, res) => {
  try {
    let pageId = req.query.pageId

    if (!pageId) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide pageId in the query params"))
    }

    const deletePage = await SettingModel.findOneAndUpdate(
      { 'pages._id': pageId },
      { $pull: { pages: { _id: pageId } } },
      { new: true }
    );

    if (!deletePage) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Page not found or already deleted."))
    }

    return res.status(200).json(successResponse("Selected page deleted successfully", deletePage))

  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}






exports.get_page_by_slug = async (req, res) => {
  try {
    const slug = req.query.slug;

    // Validate input
    if (!slug) {
      return res.status(400).json(
        errorResponse(
          messages.generalError.somethingWentWrong,
          "Slug is required"
        )
      );
    }

    // Fetch all sections with their pages
    const settings = await SettingModel.find();

    if (!settings || settings.length === 0) {
      return res.status(400).json(
        errorResponse(
          messages.generalError.somethingWentWrong,
          "No sections found"
        )
      );
    }

    // Search for the page with the matching slug across all sections
    let foundPage = null;
    settings.forEach((section) => {
      const page = section.pages.find((p) => p.slug === slug);
      if (page) {
        foundPage = page;
      }
    });

    if (!foundPage) {
      return res.status(404).json(
        errorResponse(
          messages.generalError.somethingWentWrong,
          "Page not found with this slug"
        )
      );
    }

    // Return the matching page details
    return res.status(200).json(successResponse("Page details retrieved", foundPage));
  } catch (error) {
    console.error("ERROR::", error);
    return res
      .status(500)
      .json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
};

