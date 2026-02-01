class AddMissingFieldsToJobs < ActiveRecord::Migration[8.0]
  def change
    add_column :jobs, :job_type, :string unless column_exists?(:jobs, :job_type)
    add_column :jobs, :modality, :string unless column_exists?(:jobs, :modality)
  end
end