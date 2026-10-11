-- Revert the optional clinic-gallery template selector while preserving every
-- gallery photo and caption stored in page_media.
DROP TABLE `page_media_collection_settings`;
