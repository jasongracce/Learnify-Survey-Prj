-- Convert q8 from single-select scalar to multi-select array.
-- Renames q8_top_feature → q8_top_features for consistency with q3/q4/q9.

alter table survey_responses
  alter column q8_top_feature drop not null,
  alter column q8_top_feature type text[] using
    case
      when q8_top_feature is null or q8_top_feature = '' then null
      else array[q8_top_feature]
    end;

alter table survey_responses rename column q8_top_feature to q8_top_features;
